import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Platform, Animated, StyleSheet, StatusBar, Easing,
    KeyboardAvoidingView, Modal, Alert,
} from 'react-native';
import { pacientesApi } from '../api/pacientesApi';
import { PacienteForm } from '../interfaces/paciente.interface';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    User, Mail, Phone, MapPin, Activity, Droplet, AlertTriangle,
    Calendar, CheckCircle, Info, Home, Heart, Shield, Pill,
    Stethoscope, Plus, X, Search, Edit3, Trash2, ChevronDown,
    ChevronUp, Users, RefreshCw, FileX, UserCheck,
} from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────────────────────
// PALETA
// ─────────────────────────────────────────────────────────────────────────────
const P = {
    bg:'#f0ede8', bgWarm:'#f7f4f0', surface:'#ffffff', surfaceAlt:'#faf8f5',
    border:'#e2ddd7', borderFocus:'#0d9488',
    teal:'#0d9488', tealLight:'#ccfbf1', tealMid:'#5eead4', tealDark:'#0f766e', tealSoft:'#f0fdfa',
    rose:'#e11d48', roseLight:'#fff1f2',
    amber:'#d97706', amberLight:'#fffbeb',
    violet:'#7c3aed', violetLight:'#f5f3ff',
    slate:'#1e293b', slateMid:'#64748b', slateLight:'#94a3b8',
    white:'#ffffff',
};

// Colores de gradiente para avatars (por posición del alfabeto)
const AVATAR_COLORS = [
    ['#0d9488','#0f766e'], ['#7c3aed','#6d28d9'], ['#d97706','#b45309'],
['#e11d48','#be123c'], ['#0284c7','#0369a1'], ['#059669','#047857'],
['#dc2626','#b91c1c'], ['#9333ea','#7e22ce'], ['#ea580c','#c2410c'],
];

const getAvatarColor = (name: string) => {
    const idx = (name.charCodeAt(0) - 65) % AVATAR_COLORS.length;
    return AVATAR_COLORS[Math.max(0, idx)];
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => {
    const shimmer = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, delay, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
                              Animated.timing(shimmer, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const op = shimmer.interpolate({ inputRange: [0,1], outputRange: [0.4, 0.9] });
    return (
        <Animated.View style={[sk.card, { opacity: op }]}>
        <View style={sk.avatar} />
        <View style={sk.lines}>
        <View style={sk.line1} />
        <View style={sk.line2} />
        </View>
        </Animated.View>
    );
};
const sk = StyleSheet.create({
    card: { flexDirection:'row', alignItems:'center', backgroundColor: P.white, borderRadius:20, padding:14, marginBottom:12, borderWidth:1, borderColor:P.border, gap:14 },
    avatar: { width:48, height:48, borderRadius:24, backgroundColor: P.border },
    lines: { flex:1, gap:8 },
    line1: { height:14, borderRadius:7, backgroundColor:P.border, width:'65%' },
    line2: { height:10, borderRadius:5, backgroundColor:P.border, width:'40%' },
});

// ─────────────────────────────────────────────────────────────────────────────
// CHIP DISPLAY (solo lectura) y CHIP EDITABLE
// ─────────────────────────────────────────────────────────────────────────────
const DisplayChip = ({ label, color, bg, border }: { label:string; color:string; bg:string; border:string }) => (
    <View style={[dc.chip, { backgroundColor: bg, borderColor: border }]}>
    <Text style={[dc.txt, { color }]} numberOfLines={1}>{label}</Text>
    </View>
);
const dc = StyleSheet.create({
    chip: { paddingHorizontal:9, paddingVertical:3, borderRadius:14, borderWidth:1 },
    txt: { fontSize:11, fontWeight:'700' },
});

const EditChip = ({ label, color, bg, border, onRemove }: any) => {
    const sc = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.spring(sc,{toValue:1,tension:80,friction:7,useNativeDriver:true}).start(); },[]);
    const press = () => Animated.spring(sc,{toValue:0,tension:80,friction:7,useNativeDriver:true}).start(onRemove);
    return (
        <Animated.View style={[ec.chip, { backgroundColor:bg, borderColor:border, transform:[{scale:sc}] }]}>
        <Text style={[ec.txt,{color}]} numberOfLines={1}>{label}</Text>
        <TouchableOpacity onPress={press} hitSlop={{top:8,bottom:8,left:8,right:8}}>
        <X color={color} size={10} strokeWidth={2.5}/>
        </TouchableOpacity>
        </Animated.View>
    );
};
const ec = StyleSheet.create({
    chip: { flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:4,borderRadius:16,borderWidth:1,maxWidth:180 },
    txt: { fontSize:11,fontWeight:'700',flexShrink:1 },
});

// ─────────────────────────────────────────────────────────────────────────────
// CHIP FIELD (editable)
// ─────────────────────────────────────────────────────────────────────────────
const ChipField = ({ icon:Icon, iconColor, label, labelColor, placeholder, items, onAdd, onRemove, chipColor, chipBg, chipBorder }:any) => {
    const [val, setVal] = useState('');
    const add = () => { const t = val.trim(); if(t){ onAdd(t); setVal(''); } };
    return (
        <View style={cf.wrap}>
        <View style={cf.hdr}><Icon color={iconColor} size={12} strokeWidth={2.5}/><Text style={[cf.lbl,{color:labelColor}]}>{label}</Text></View>
        <View style={cf.row}>
        <TextInput style={cf.inp} placeholder={placeholder} placeholderTextColor={P.slateLight} value={val} onChangeText={setVal} onSubmitEditing={add} returnKeyType="done" selectionColor={P.teal}/>
        <TouchableOpacity onPress={add} style={[cf.btn,{backgroundColor:iconColor+'15',borderColor:iconColor+'40'}]}>
        <Plus color={iconColor} size={15} strokeWidth={2.5}/>
        </TouchableOpacity>
        </View>
        {items.length > 0 && (
            <View style={cf.chips}>
            {items.map((it:string,i:number) => <EditChip key={`${it}-${i}`} label={it} color={chipColor} bg={chipBg} border={chipBorder} onRemove={()=>onRemove(i)}/>)}
            </View>
        )}
        </View>
    );
};
const cf = StyleSheet.create({
    wrap:{gap:8}, hdr:{flexDirection:'row',alignItems:'center',gap:5},
    lbl:{fontSize:10,fontWeight:'700',letterSpacing:0.8,textTransform:'uppercase'},
    row:{flexDirection:'row',alignItems:'center',gap:8},
    inp:{flex:1,backgroundColor:P.surfaceAlt,borderWidth:1.5,borderColor:P.border,borderRadius:12,paddingHorizontal:13,paddingVertical:10,fontSize:14,color:P.slate,outlineStyle:'none'},
    btn:{width:40,height:40,borderRadius:12,borderWidth:1.5,alignItems:'center',justifyContent:'center'},
    chips:{flexDirection:'row',flexWrap:'wrap',gap:6},
});

// ─────────────────────────────────────────────────────────────────────────────
// INPUT PREMIUM
// ─────────────────────────────────────────────────────────────────────────────
const PremiumInput = ({ icon:Icon, iconColor=P.slateLight, placeholder, value, onChangeText, keyboardType='default', autoCapitalize='sentences', editable=true, error }:any) => {
    const border = useRef(new Animated.Value(0)).current;
    const hasVal = !!value, hasErr = !!error;
    const onFocus = () => Animated.spring(border,{toValue:1,useNativeDriver:false}).start();
    const onBlur  = () => Animated.spring(border,{toValue:0,useNativeDriver:false}).start();
    const bc = border.interpolate({inputRange:[0,1],outputRange:[hasErr?P.rose:P.border,P.teal]});
    const bg = border.interpolate({inputRange:[0,1],outputRange:[hasErr?'#fff5f5':P.surface,P.tealSoft]});
    const so = border.interpolate({inputRange:[0,1],outputRange:[0,0.18]});
    return (
        <View style={{marginBottom:10}}>
        <Animated.View style={[pi.wrap,{borderColor:hasErr?P.rose:bc,backgroundColor:hasErr?'#fff5f5':bg,shadowColor:P.teal,shadowOpacity:so,shadowRadius:10,shadowOffset:{width:0,height:0}}]}>
        <View style={pi.ico}><Icon color={hasErr?P.rose:hasVal?P.teal:iconColor} size={16} strokeWidth={2}/></View>
        <TextInput style={pi.inp} placeholder={placeholder} placeholderTextColor={P.slateLight} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} editable={editable} onFocus={onFocus} onBlur={onBlur} selectionColor={P.teal}/>
        {hasErr ? <View style={pi.badge}><AlertTriangle color={P.rose} size={13} strokeWidth={2.5}/></View>
        : hasVal ? <View style={pi.badge}><CheckCircle color={P.teal} size={13} strokeWidth={2.5}/></View> : null}
        </Animated.View>
        {hasErr && <View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{error}</Text></View>}
        </View>
    );
};
const pi = StyleSheet.create({
    wrap:{flexDirection:'row',alignItems:'center',borderWidth:1.5,borderRadius:14,paddingHorizontal:13,paddingVertical:12,elevation:1},
    ico:{marginRight:10}, inp:{flex:1,fontSize:15,color:P.slate,outlineStyle:'none'},
    badge:{marginLeft:6,width:18,height:18,alignItems:'center',justifyContent:'center'},
    err:{flexDirection:'row',alignItems:'center',gap:4,marginTop:3,paddingLeft:4},
    errT:{color:P.rose,fontSize:10,fontWeight:'600',flex:1},
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEAD
// ─────────────────────────────────────────────────────────────────────────────
const SectionHead = ({ num, label, icon:Icon, color=P.teal }:any) => (
    <View style={sh.row}>
    <View style={[sh.badge,{backgroundColor:color+'15'}]}><Icon color={color} size={11} strokeWidth={2.5}/><Text style={[sh.num,{color}]}>{num}</Text></View>
    <Text style={[sh.lbl,{color}]}>{label}</Text>
    <View style={[sh.line,{backgroundColor:color+'25'}]}/>
    </View>
);
const sh = StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',marginBottom:10,marginTop:14,gap:8},
    badge:{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:9,paddingVertical:4,borderRadius:20},
    num:{fontSize:10,fontWeight:'800',letterSpacing:0.5},
    lbl:{fontSize:13,fontWeight:'700',letterSpacing:0.2},
    line:{flex:1,height:1},
});

// ─────────────────────────────────────────────────────────────────────────────
// STYLED PICKER
// ─────────────────────────────────────────────────────────────────────────────
const StyledPicker = ({ icon:Icon, iconColor=P.teal, value, onValueChange, children, error }:any) => (
    <View style={{marginBottom:10}}>
    <View style={[sp.wrap,error&&{borderColor:P.rose}]}>
    <Icon color={value?iconColor:P.slateLight} size={16} strokeWidth={2} style={{marginRight:10}}/>
    <Picker selectedValue={value} onValueChange={onValueChange} style={sp.picker} dropdownIconColor={P.slateLight}>{children}</Picker>
    </View>
    {error && <View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{error}</Text></View>}
    </View>
);
const sp = StyleSheet.create({
    wrap:{flexDirection:'row',alignItems:'center',backgroundColor:P.surfaceAlt,borderWidth:1.5,borderColor:P.border,borderRadius:14,paddingHorizontal:13,paddingVertical:2},
    picker:{flex:1,color:P.slate,backgroundColor:'transparent',borderWidth:0,height:50,outlineStyle:'none'},
});

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE ÉXITO/CONFIRMACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const SuccessModal = ({ title, message, onDone, icon:Icon=CheckCircle, color=P.teal }:any) => {
    const bdOp = useRef(new Animated.Value(0)).current;
    const cs   = useRef(new Animated.Value(0.82)).current;
    const cks  = useRef(new Animated.Value(0)).current;
    const r1   = useRef(new Animated.Value(0.5)).current, r1O = useRef(new Animated.Value(0.7)).current;
    const r2   = useRef(new Animated.Value(0.5)).current, r2O = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.timing(bdOp,{toValue:1,duration:240,useNativeDriver:true}).start();
        setTimeout(()=>Animated.spring(cs,{toValue:1,tension:65,friction:8,useNativeDriver:true}).start(),40);
        setTimeout(()=>Animated.spring(cks,{toValue:1,tension:80,friction:6,useNativeDriver:true}).start(),280);
        const loop = Animated.loop(Animated.stagger(550,[
            Animated.parallel([Animated.timing(r1,{toValue:1.55,duration:1300,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(r1O,{toValue:0,duration:1300,useNativeDriver:true})]),
                                                    Animated.parallel([Animated.timing(r2,{toValue:1.55,duration:1300,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(r2O,{toValue:0,duration:1300,useNativeDriver:true})]),
        ]));
        const t = setTimeout(()=>loop.start(),320);
        return ()=>{ clearTimeout(t); loop.stop(); };
    },[]);

    return (
        <Animated.View style={[sm.bd,{opacity:bdOp}]}>
        <Animated.View style={[sm.card,{transform:[{scale:cs}]}]}>
        <View style={[sm.topBar,{backgroundColor:color}]}/>
        <View style={sm.circleArea}>
        <Animated.View style={[sm.ring,{transform:[{scale:r1}],opacity:r1O,borderColor:color}]}/>
        <Animated.View style={[sm.ring,{transform:[{scale:r2}],opacity:r2O,borderColor:color+'80'}]}/>
        <Animated.View style={[sm.outer,{transform:[{scale:cks}],backgroundColor:color+'20',borderColor:color+'50'}]}>
        <View style={[sm.inner,{backgroundColor:color}]}><Icon color={P.white} size={32} strokeWidth={2}/></View>
        </Animated.View>
        </View>
        <View style={{alignItems:'center',paddingHorizontal:24,gap:6,marginTop:8}}>
        <Text style={sm.title}>{title}</Text>
        <Text style={sm.desc}>{message}</Text>
        </View>
        <View style={{width:'100%',paddingHorizontal:20,marginTop:18}}>
        <TouchableOpacity onPress={onDone} activeOpacity={0.85} style={[sm.btn,{backgroundColor:color}]}>
        <Text style={sm.btnT}>Continuar</Text>
        </TouchableOpacity>
        </View>
        </Animated.View>
        </Animated.View>
    );
};
const sm = StyleSheet.create({
    bd:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(15,23,42,0.58)',alignItems:'center',justifyContent:'center',paddingHorizontal:26,zIndex:999},
                             card:{backgroundColor:P.white,borderRadius:28,width:'100%',overflow:'hidden',paddingBottom:24,alignItems:'center',shadowColor:'#000',shadowOpacity:0.28,shadowRadius:32,shadowOffset:{width:0,height:14},elevation:22},
                             topBar:{height:5,width:'100%'},
                             circleArea:{marginTop:26,width:100,height:100,alignItems:'center',justifyContent:'center'},
                             ring:{position:'absolute',width:84,height:84,borderRadius:42,borderWidth:1.5},
                             outer:{position:'absolute',width:84,height:84,borderRadius:42,alignItems:'center',justifyContent:'center',borderWidth:2.5},
                             inner:{width:64,height:64,borderRadius:32,alignItems:'center',justifyContent:'center'},
                             title:{fontSize:20,fontWeight:'800',color:P.slate,letterSpacing:-0.3,textAlign:'center'},
                             desc:{fontSize:13,color:P.slateMid,textAlign:'center',lineHeight:19},
                             btn:{borderRadius:13,paddingVertical:13,alignItems:'center',justifyContent:'center'},
                             btnT:{color:P.white,fontSize:14,fontWeight:'700',letterSpacing:0.2},
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const calcularEdad = (fecha: string): number | null => {
    if (!fecha) return null;
    const hoy = new Date();
    const nac = new Date(fecha.replace(/\//g,'-') + (fecha.includes('T')?'':'T12:00:00'));
    if (isNaN(nac.getTime())) return null;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
};

const splitChips = (str: string): string[] =>
str ? str.split(',').map(s=>s.trim()).filter(Boolean) : [];

const cap = (t: string) =>
t ? t.toLowerCase().split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ') : '';

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE PACIENTE ANIMADA
// ─────────────────────────────────────────────────────────────────────────────
const PacienteCard = ({ paciente, index, onEdit, onDelete }: {
    paciente: any; index: number;
    onEdit: (p:any)=>void; onDelete:(id:any,name:string)=>void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const entryAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;

    // Entrada escalonada
    useEffect(()=>{
        const delay = Math.min(index * 60, 400);
        Animated.parallel([
            Animated.timing(entryAnim,{toValue:1,duration:400,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
                          Animated.spring(scaleAnim,{toValue:1,tension:60,friction:9,delay,useNativeDriver:true}),
        ]).start();
    },[]);

    const toggle = () => {
        const toVal = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.parallel([
            Animated.timing(slideAnim,{toValue:toVal,duration:280,easing:Easing.out(Easing.cubic),useNativeDriver:false}),
                          Animated.timing(fadeAnim, {toValue:toVal,duration:220,useNativeDriver:true}),
        ]).start();
    };

    const [c1,c2] = getAvatarColor(paciente.nombre||'A');
    const edad = calcularEdad(paciente.fecha_nacimiento);
    const alergias     = splitChips(paciente.alergias);
    const enfermedades = splitChips(paciente.enfermedades_cronicas);
    const medicamentos = splitChips(paciente.medicamentos);

    return (
        <Animated.View style={{ opacity:entryAnim, transform:[{scale:scaleAnim},{translateY:entryAnim.interpolate({inputRange:[0,1],outputRange:[12,0]})}] }}>
        <View style={[pc.card, expanded && pc.cardExpanded]}>

        {/* ROW PRINCIPAL */}
        <TouchableOpacity style={pc.header} onPress={toggle} activeOpacity={0.72}>
        {/* Avatar con gradiente simulado */}
        <View style={[pc.avatarOuter,{borderColor:c1+'50'}]}>
        <View style={[pc.avatar,{backgroundColor:c1}]}>
        <Text style={pc.avatarTxt}>{(paciente.nombre||'?').charAt(0)}{(paciente.apellido||'?').charAt(0)}</Text>
        </View>
        </View>

        <View style={{flex:1,marginLeft:13}}>
        <Text style={pc.nombre}>{paciente.nombre} {paciente.apellido}</Text>
        <View style={pc.metaRow}>
        {/* Badge tipo sangre */}
        {paciente.tipo_sangre ? (
            <View style={pc.bloodBadge}>
            <Droplet color={P.rose} size={10} strokeWidth={2}/>
            <Text style={pc.bloodBadgeT}>{paciente.tipo_sangre}</Text>
            </View>
        ) : null}
        {edad !== null && <Text style={pc.edad}>{edad} años</Text>}
        {paciente.ciudad ? <Text style={pc.ciudad}>{paciente.ciudad}</Text> : null}
        </View>
        {/* Primera enfermedad como preview */}
        {enfermedades.length > 0 && (
            <Text style={pc.preview} numberOfLines={1}>
            {enfermedades[0]}{enfermedades.length > 1 ? ` +${enfermedades.length-1}` : ''}
            </Text>
        )}
        </View>

        <View style={[pc.chevron, expanded && pc.chevronActive]}>
        {expanded
            ? <ChevronUp  color={P.teal} size={18} strokeWidth={2.5}/>
            : <ChevronDown color={P.slateLight} size={18} strokeWidth={2.5}/>
        }
        </View>
        </TouchableOpacity>

        {/* ACORDEÓN */}
        {expanded && (
            <Animated.View style={{opacity:fadeAnim}}>
            <View style={pc.divider}/>
            <View style={pc.body}>

            {/* Contacto */}
            <SectionHead num="01" label="Contacto" icon={Phone} color={P.tealDark}/>
            <View style={pc.infoGrid}>
            <View style={pc.infoItem}><Phone color={P.slateMid} size={13} strokeWidth={2}/><Text style={pc.infoTxt}>{paciente.telefono||'—'}</Text></View>
            <View style={pc.infoItem}><Mail  color={P.slateMid} size={13} strokeWidth={2}/><Text style={pc.infoTxt} numberOfLines={1}>{paciente.correo||'—'}</Text></View>
            {paciente.direccion&&<View style={pc.infoItem}><MapPin color={P.slateMid} size={13} strokeWidth={2}/><Text style={pc.infoTxt} numberOfLines={2}>{paciente.direccion}{paciente.ciudad?`, ${paciente.ciudad}`:''}</Text></View>}
            </View>

            {/* Historial médico */}
            <SectionHead num="02" label="Historial Médico" icon={Heart} color={P.rose}/>

            {enfermedades.length > 0 && (
                <View style={pc.chipSection}>
                <Text style={pc.chipSectionLbl}>Enfermedades</Text>
                <View style={pc.chipRow}>
                {enfermedades.map((e,i)=><DisplayChip key={i} label={e} color={P.tealDark} bg={P.tealSoft} border={P.tealLight}/>)}
                </View>
                </View>
            )}

            {alergias.length > 0 && (
                <View style={pc.chipSection}>
                <Text style={pc.chipSectionLbl}>Alergias</Text>
                <View style={pc.chipRow}>
                {alergias.map((a,i)=><DisplayChip key={i} label={a} color={P.amber} bg={P.amberLight} border="#fde68a"/>)}
                </View>
                </View>
            )}

            {medicamentos.length > 0 && (
                <View style={pc.chipSection}>
                <Text style={pc.chipSectionLbl}>Medicamentos</Text>
                <View style={pc.chipRow}>
                {medicamentos.map((m,i)=><DisplayChip key={i} label={m} color={P.violet} bg={P.violetLight} border="#ddd6fe"/>)}
                </View>
                </View>
            )}

            {enfermedades.length===0 && alergias.length===0 && medicamentos.length===0 && (
                <View style={pc.emptyMedical}><Text style={pc.emptyMedicalT}>Sin antecedentes registrados</Text></View>
            )}

            {/* Emergencias */}
            {(paciente.contacto_emergencia||paciente.telefono_emergencia) && (
                <>
                <SectionHead num="03" label="Emergencias" icon={Shield} color={P.amber}/>
                {paciente.contacto_emergencia&&<View style={pc.infoItem}><User color={P.amber} size={13} strokeWidth={2}/><Text style={pc.infoTxt}>{paciente.contacto_emergencia}</Text></View>}
                {paciente.telefono_emergencia&&<View style={pc.infoItem}><Phone color={P.amber} size={13} strokeWidth={2}/><Text style={pc.infoTxt}>{paciente.telefono_emergencia}</Text></View>}
                </>
            )}

            </View>

            {/* Acciones */}
            <View style={pc.actions}>
            <TouchableOpacity onPress={()=>onEdit(paciente)} style={pc.btnEdit} activeOpacity={0.8}>
            <Edit3 color={P.tealDark} size={15} strokeWidth={2.5}/>
            <Text style={pc.btnEditT}>Editar Expediente</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>onDelete(paciente.id,`${paciente.nombre} ${paciente.apellido}`)} style={pc.btnDel} activeOpacity={0.8}>
            <Trash2 color={P.rose} size={15} strokeWidth={2.5}/>
            </TouchableOpacity>
            </View>
            </Animated.View>
        )}
        </View>
        </Animated.View>
    );
};
const pc = StyleSheet.create({
    card:{ backgroundColor:P.white, borderRadius:20, marginBottom:12, borderWidth:1.5, borderColor:P.border, overflow:'hidden', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:2 },
    cardExpanded:{ borderColor:P.tealLight+'90', shadowColor:P.teal, shadowOpacity:0.08 },
    header:{ flexDirection:'row', alignItems:'center', padding:14 },
    avatarOuter:{ width:52, height:52, borderRadius:26, borderWidth:2, alignItems:'center', justifyContent:'center' },
    avatar:{ width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
    avatarTxt:{ color:P.white, fontWeight:'800', fontSize:15, letterSpacing:0.5 },
    nombre:{ fontSize:16, fontWeight:'800', color:P.slate, letterSpacing:-0.2 },
    metaRow:{ flexDirection:'row', alignItems:'center', gap:6, marginTop:3, flexWrap:'wrap' },
    bloodBadge:{ flexDirection:'row', alignItems:'center', gap:3, backgroundColor:'#fff1f2', paddingHorizontal:7, paddingVertical:2, borderRadius:10, borderWidth:1, borderColor:'#fecdd3' },
    bloodBadgeT:{ color:P.rose, fontSize:10, fontWeight:'800' },
    edad:{ fontSize:11, color:P.slateMid, fontWeight:'600' },
    ciudad:{ fontSize:11, color:P.slateLight, fontWeight:'500' },
    preview:{ fontSize:11, color:P.slateMid, marginTop:3, fontStyle:'italic' },
    chevron:{ width:34, height:34, borderRadius:17, backgroundColor:P.surfaceAlt, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:P.border },
    chevronActive:{ backgroundColor:P.tealSoft, borderColor:P.tealLight },
    divider:{ height:1, backgroundColor:P.border },
    body:{ padding:14, paddingBottom:6 },
    infoGrid:{ gap:6, marginBottom:4 },
    infoItem:{ flexDirection:'row', alignItems:'flex-start', gap:8 },
    infoTxt:{ color:P.slate, fontSize:13, fontWeight:'500', flex:1, lineHeight:18 },
    chipSection:{ marginBottom:10 },
    chipSectionLbl:{ fontSize:9, fontWeight:'800', color:P.slateLight, letterSpacing:1, textTransform:'uppercase', marginBottom:5 },
    chipRow:{ flexDirection:'row', flexWrap:'wrap', gap:5 },
    emptyMedical:{ backgroundColor:P.surfaceAlt, borderRadius:10, padding:10, alignItems:'center', marginBottom:8 },
    emptyMedicalT:{ color:P.slateLight, fontSize:12, fontWeight:'600', fontStyle:'italic' },
    actions:{ flexDirection:'row', gap:10, padding:14, paddingTop:8 },
    btnEdit:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:11, borderRadius:13, backgroundColor:P.tealSoft, borderWidth:1.5, borderColor:P.tealLight, gap:6 },
    btnEditT:{ color:P.tealDark, fontWeight:'800', fontSize:13 },
    btnDel:{ width:44, height:44, borderRadius:13, backgroundColor:P.roseLight, borderWidth:1.5, borderColor:'#fecdd3', alignItems:'center', justifyContent:'center' },
});

// ─────────────────────────────────────────────────────────────────────────────
// PANTALLA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ListaPacientes({ navigation }: any) {
    const [pacientes,  setPacientes]  = useState<any[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [busqueda,   setBusqueda]   = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [pacienteEditando, setPacienteEditando] = useState<any>(null);
    const [formData,   setFormData]   = useState<any>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj,    setDateObj]    = useState(new Date());
    const [alergiasEdit,     setAlergiasEdit]     = useState<string[]>([]);
    const [enfermedadesEdit, setEnfermedadesEdit] = useState<string[]>([]);
    const [medicamentosEdit, setMedicamentosEdit] = useState<string[]>([]);
    const [notif,      setNotif]      = useState<string|null>(null);
    const [fieldErrors,setFieldErrors]= useState<Record<string,string>>({});
    const [successMsg, setSuccessMsg] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const headerOp  = useRef(new Animated.Value(0)).current;
    const headerY   = useRef(new Animated.Value(-18)).current;
    const iconPulse = useRef(new Animated.Value(1)).current;
    const searchFocus = useRef(new Animated.Value(0)).current;

    useEffect(()=>{
        Animated.parallel([
            Animated.timing(headerOp,{toValue:1,duration:550,useNativeDriver:true}),
                          Animated.timing(headerY, {toValue:0,duration:480,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
        ]).start();
        Animated.loop(Animated.sequence([
            Animated.timing(iconPulse,{toValue:1.08,duration:1800,easing:Easing.inOut(Easing.sine),useNativeDriver:true}),
                                        Animated.timing(iconPulse,{toValue:1,   duration:1800,easing:Easing.inOut(Easing.sine),useNativeDriver:true}),
        ])).start();
        cargarPacientes();
    },[]);

    const cargarPacientes = async (isRefresh=false) => {
        if(isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const query=`query{pacientes{id nombre apellido telefono correo tipo_sangre direccion ciudad estado codigo_postal fecha_nacimiento genero alergias enfermedades_cronicas medicamentos contacto_emergencia telefono_emergencia}}`;
            const res = await pacientesApi.post('',{query});
            if(res.data.data) setPacientes(res.data.data.pacientes);
        } catch { /* silencioso */ }
        finally { setLoading(false); setRefreshing(false); }
    };

    const eliminarPaciente = (id: any, nombre: string) => {
        const exec = async () => {
            try {
                const query=`mutation RemovePaciente($id:Int!){removePaciente(id:$id){id}}`;
                const res = await pacientesApi.post('',{query,variables:{id:parseInt(id)}});
                if(res.data.errors && !res.data.errors[0].message.includes("Cannot return null")) return;
                setPacientes(p=>p.filter(x=>String(x.id)!==String(id)));
                setSuccessMsg({title:'Expediente Eliminado',desc:'El registro fue borrado del sistema.',icon:Trash2,color:P.rose});
            } catch {}
        };
        if(Platform.OS==='web'){
            if(window.confirm(`¿Eliminar a ${nombre} del sistema?`)) exec();
        } else {
            Alert.alert('Confirmar eliminación',`¿Eliminar a ${nombre}?`,[
                {text:'Cancelar',style:'cancel'},
                {text:'Eliminar',style:'destructive',onPress:exec},
            ]);
        }
    };

    const abrirModalEdicion = (paciente: any) => {
        setPacienteEditando(paciente);
        const {__typename,...datos}=paciente;
        setFormData(datos);
        setFieldErrors({}); setNotif(null);
        setAlergiasEdit(splitChips(datos.alergias));
        setEnfermedadesEdit(splitChips(datos.enfermedades_cronicas));
        setMedicamentosEdit(splitChips(datos.medicamentos));
        if(datos.fecha_nacimiento){
            const d=new Date(datos.fecha_nacimiento.replace(/\//g,'-')+'T12:00:00');
            if(!isNaN(d.getTime())) setDateObj(d);
        }
        setModalVisible(true);
    };

    const setField = (name:string, value:string) => {
        if(fieldErrors[name]) setFieldErrors(p=>{const n={...p};delete n[name];return n;});
        setNotif(null);
        if(name==='codigo_postal') setFormData({...formData,[name]:parseInt(value)||0});
        else if(name==='correo')   setFormData({...formData,[name]:value.toLowerCase().trim()});
        else if(name==='nombre'||name==='apellido') setFormData({...formData,[name]:cap(value)});
        else setFormData({...formData,[name]:value});
    };

    const addChip=(arr:string[],setArr:any,v:string)=>setArr([...arr,v]);
    const delChip=(arr:string[],setArr:any,i:number)=>setArr(arr.filter((_:any,idx:number)=>idx!==i));

    const guardarEdicion = async () => {
        const dominios=['@gmail.com','@yahoo.com','@outlook.com','@hotmail.com','@live.com','@icloud.com'];
        const err:Record<string,string>={};
        if(!formData.nombre)   err['nombre']='Requerido.';
        if(!formData.apellido) err['apellido']='Requerido.';
        if(!formData.correo||!dominios.some(d=>formData.correo.endsWith(d))) err['correo']='Correo inválido.';
        if(!formData.telefono||String(formData.telefono).replace(/\D/g,'').length<10) err['telefono']='Mín. 10 dígitos.';
        if(!formData.tipo_sangre) err['tipo_sangre']='Requerido.';
        if(!formData.genero)      err['genero']='Requerido.';
        if(Object.keys(err).length>0){setFieldErrors(err);setNotif('Corrige los campos marcados.');return;}

        try {
            const {__typename,...datos}=formData;
            const payload={...datos,id:parseInt(pacienteEditando.id),codigo_postal:parseInt(datos.codigo_postal)||0,
                alergias:alergiasEdit.join(', '),enfermedades_cronicas:enfermedadesEdit.join(', '),medicamentos:medicamentosEdit.join(', ')};
                const query=`mutation UpdatePaciente($input:UpdatePacienteInput!){updatePaciente(input:$input){id}}`;
                const res=await pacientesApi.post('',{query,variables:{input:payload}});
                if(res.data.errors){setNotif('Error del servidor: '+res.data.errors[0].message);return;}
                setModalVisible(false);
                setSuccessMsg({title:'Actualización Exitosa',desc:'Los datos del paciente fueron actualizados.',icon:UserCheck,color:P.teal});
                cargarPacientes();
        } catch { setNotif('Error de conexión con el servidor.'); }
    };

    // Filtro y orden
    const filtrados = [...pacientes]
    .filter(p=>{
        if(!busqueda) return true;
        const q=busqueda.toLowerCase();
        const edad=calcularEdad(p.fecha_nacimiento);
        return (
            (p.nombre||'').toLowerCase().includes(q)||
            (p.apellido||'').toLowerCase().includes(q)||
            (p.enfermedades_cronicas||'').toLowerCase().includes(q)||
            (p.alergias||'').toLowerCase().includes(q)||
            (p.tipo_sangre||'').toLowerCase().includes(q)||
            (p.ciudad||'').toLowerCase().includes(q)||
            String(edad||'')===q
        );
    })
    .sort((a,b)=>a.nombre.localeCompare(b.nombre));

    // Agrupar por letra
    let letraActual = '';

    const onSearchFocus=()=>Animated.spring(searchFocus,{toValue:1,useNativeDriver:false}).start();
    const onSearchBlur= ()=>Animated.spring(searchFocus,{toValue:0,useNativeDriver:false}).start();
    const searchBorder=searchFocus.interpolate({inputRange:[0,1],outputRange:[P.border,P.teal]});

    return (
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <StatusBar barStyle="dark-content" backgroundColor={P.bg}/>
        <View style={s.container}>

        {/* ── HEADER PREMIUM ────────────────────────────────────── */}
        <Animated.View style={[s.header,{opacity:headerOp,transform:[{translateY:headerY}]}]}>
        <View style={s.headerBar}/>
        <View style={s.headerBody}>
        <Animated.View style={{transform:[{scale:iconPulse}]}}>
        <View style={s.iconRing}><Users color={P.teal} size={26} strokeWidth={1.8}/></View>
        </Animated.View>
        <View style={{flex:1}}>
        <Text style={s.eye}>BASE DE DATOS</Text>
        <Text style={s.title}>Directorio Médico</Text>
        <Text style={s.sub}>Gestión de expedientes clínicos</Text>
        </View>
        <TouchableOpacity onPress={()=>cargarPacientes(true)} style={s.refreshBtn} activeOpacity={0.7}>
        <Animated.View style={{transform:[{rotate:refreshing?'180deg':'0deg'}]}}>
        <RefreshCw color={P.teal} size={18} strokeWidth={2.5}/>
        </Animated.View>
        </TouchableOpacity>
        </View>

        {/* Stats pills */}
        {!loading && (
            <View style={s.statsRow}>
            <View style={s.statPill}>
            <Users color={P.teal} size={12} strokeWidth={2.5}/>
            <Text style={s.statPillT}>{pacientes.length} total</Text>
            </View>
            {busqueda ? (
                <View style={[s.statPill,{backgroundColor:P.amberLight,borderColor:'#fde68a'}]}>
                <Search color={P.amber} size={12} strokeWidth={2.5}/>
                <Text style={[s.statPillT,{color:P.amber}]}>{filtrados.length} resultados</Text>
                </View>
            ) : null}
            </View>
        )}

        {/* Buscador */}
        <View style={s.searchWrap}>
        <Animated.View style={[s.searchBox,{borderColor:searchBorder}]}>
        <Search color={P.slateLight} size={18} style={{marginRight:10}}/>
        <TextInput
        style={s.searchInput}
        placeholder="Buscar por nombre, diagnóstico, tipo de sangre…"
        placeholderTextColor={P.slateLight}
        value={busqueda}
        onChangeText={setBusqueda}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        selectionColor={P.teal}
        />
        {busqueda ? (
            <TouchableOpacity onPress={()=>setBusqueda('')} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <X color={P.slateLight} size={16} strokeWidth={2}/>
            </TouchableOpacity>
        ) : null}
        </Animated.View>
        </View>
        </Animated.View>

        {/* ── CONTENIDO ─────────────────────────────────────────── */}
        {loading ? (
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {[0,1,2,3,4].map(i=><SkeletonCard key={i} delay={i*80}/>)}
            </ScrollView>
        ) : filtrados.length === 0 ? (
            <View style={s.emptyState}>
            <View style={s.emptyIcon}><FileX color={P.slateLight} size={40} strokeWidth={1.5}/></View>
            <Text style={s.emptyTitle}>{busqueda ? 'Sin resultados' : 'Sin pacientes'}</Text>
            <Text style={s.emptyDesc}>
            {busqueda
                ? `No se encontraron coincidencias para "${busqueda}"`
                : 'Aún no hay expedientes registrados en el sistema'}
                </Text>
                {busqueda && (
                    <TouchableOpacity onPress={()=>setBusqueda('')} style={s.emptyBtn}>
                    <Text style={s.emptyBtnT}>Limpiar búsqueda</Text>
                    </TouchableOpacity>
                )}
                </View>
        ) : (
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {filtrados.map((p,i)=>{
                const inicial = (p.nombre||'?').charAt(0).toUpperCase();
                const mostrarLetra = inicial !== letraActual;
                if(mostrarLetra) letraActual = inicial;
                return (
                    <View key={p.id}>
                    {mostrarLetra && (
                        <View style={s.letraSep}>
                        <View style={[s.letraBadge,{borderColor:getAvatarColor(p.nombre)[0]+'40',backgroundColor:getAvatarColor(p.nombre)[0]+'12'}]}>
                        <Text style={[s.letraTxt,{color:getAvatarColor(p.nombre)[0]}]}>{inicial}</Text>
                        </View>
                        <View style={s.letraLinea}/>
                        </View>
                    )}
                    <PacienteCard
                    paciente={p}
                    index={i}
                    onEdit={abrirModalEdicion}
                    onDelete={eliminarPaciente}
                    />
                    </View>
                );
            })}
            </ScrollView>
        )}

        {/* ── MODAL EDICIÓN ──────────────────────────────────────── */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        {/* Header del modal */}
        <View style={s.modalHeader}>
        <View style={s.modalHeaderBar}/>
        <View style={s.modalHeaderBody}>
        <View style={s.modalIconWrap}>
        <Edit3 color={P.teal} size={18} strokeWidth={2}/>
        </View>
        <View style={{flex:1}}>
        <Text style={s.modalTitle}>Editar Expediente</Text>
        {pacienteEditando && <Text style={s.modalSub}>{pacienteEditando.nombre} {pacienteEditando.apellido}</Text>}
        </View>
        <TouchableOpacity onPress={()=>setModalVisible(false)} style={s.modalClose}>
        <X color={P.slate} size={18} strokeWidth={2.5}/>
        </TouchableOpacity>
        </View>
        </View>

        <ScrollView style={{backgroundColor:P.bg}} contentContainerStyle={{padding:16,paddingBottom:50}} showsVerticalScrollIndicator={false}>

        <SectionHead num="01" label="Datos Personales" icon={User} color={P.teal}/>
        <View style={s.cardModal}>
        <PremiumInput icon={User} placeholder="Nombre(s)" value={formData.nombre} onChangeText={t=>setField('nombre',t)} error={fieldErrors['nombre']}/>
        <PremiumInput icon={User} placeholder="Apellidos" value={formData.apellido} onChangeText={t=>setField('apellido',t)} error={fieldErrors['apellido']}/>
        <View style={{marginBottom:10}}>
        <Text style={s.micro}>Fecha de Nacimiento</Text>
        {Platform.OS==='web'?(
            <View style={[pi.wrap,{borderColor:P.border,backgroundColor:P.surfaceAlt}]}>
            <View style={pi.ico}><Calendar color={formData.fecha_nacimiento?P.teal:P.slateLight} size={16} strokeWidth={2}/></View>
            <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.fecha_nacimiento}
            onChange={e=>setFormData((p:any)=>({...p,fecha_nacimiento:(e.target as HTMLInputElement).value}))}
            style={{flex:1,fontSize:15,color:P.slate,border:'none',outline:'none',backgroundColor:'transparent',fontFamily:'inherit',cursor:'pointer',width:'100%'} as any}/>
            </View>
        ):(
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} activeOpacity={0.7}>
            <View style={[pi.wrap,{borderColor:P.border,backgroundColor:P.surfaceAlt}]}>
            <View style={pi.ico}><Calendar color={formData.fecha_nacimiento?P.teal:P.slateLight} size={16} strokeWidth={2}/></View>
            <Text style={{flex:1,fontSize:15,color:formData.fecha_nacimiento?P.slate:P.slateLight}}>{formData.fecha_nacimiento||'Toca para seleccionar'}</Text>
            {!!formData.fecha_nacimiento&&<View style={pi.badge}><CheckCircle color={P.teal} size={13} strokeWidth={2.5}/></View>}
            </View>
            </TouchableOpacity>
        )}
        {showDatePicker&&Platform.OS!=='web'&&(
            <DateTimePicker value={dateObj} mode="date" maximumDate={new Date()}
            display={Platform.OS==='ios'?'spinner':'default'}
            onChange={(_:any,d?:Date)=>{
                if(Platform.OS!=='ios')setShowDatePicker(false);
                if(d){setDateObj(d);const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;setFormData((p:any)=>({...p,fecha_nacimiento:iso}));}
            }}/>
        )}
        {Platform.OS==='ios'&&showDatePicker&&(
            <TouchableOpacity onPress={()=>setShowDatePicker(false)} style={{alignSelf:'flex-end',paddingHorizontal:14,paddingVertical:6}}>
            <Text style={{color:P.teal,fontSize:15,fontWeight:'700'}}>Listo</Text>
            </TouchableOpacity>
        )}
        </View>
        <Text style={s.micro}>Género</Text>
        <View style={s.gRow}>
        {['Hombre','Mujer'].map(g=>{
            const on=formData.genero===g;
            return(
                <TouchableOpacity key={g} onPress={()=>setField('genero',g)} activeOpacity={0.8} style={[s.gBtn,on&&s.gBtnOn,fieldErrors['genero']&&!on&&{borderColor:P.rose+'80'}]}>
                <Text style={[s.gTxt,on&&s.gTxtOn]}>{g==='Hombre'?'♂ Hombre':'♀ Mujer'}</Text>
                </TouchableOpacity>
            );
        })}
        </View>
        {fieldErrors['genero']&&<View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{fieldErrors['genero']}</Text></View>}
        </View>

        <SectionHead num="02" label="Contacto" icon={Phone} color={P.tealDark}/>
        <View style={s.cardModal}>
        <PremiumInput icon={Phone} iconColor={P.tealDark} placeholder="Teléfono" value={String(formData.telefono||'')} onChangeText={t=>setField('telefono',t)} keyboardType="phone-pad" error={fieldErrors['telefono']}/>
        <PremiumInput icon={Mail}  iconColor={P.tealDark} placeholder="Correo electrónico" value={formData.correo} onChangeText={t=>setField('correo',t)} autoCapitalize="none" error={fieldErrors['correo']}/>
        </View>

        <SectionHead num="03" label="Ubicación" icon={MapPin} color={P.violet}/>
        <View style={s.cardModal}>
        <PremiumInput icon={Home}   iconColor={P.violet} placeholder="Dirección" value={formData.direccion} onChangeText={t=>setField('direccion',t)}/>
        <View style={{flexDirection:'row',gap:10}}>
        <View style={{flex:1}}><PremiumInput icon={MapPin} iconColor={P.violet} placeholder="Ciudad" value={formData.ciudad} onChangeText={t=>setField('ciudad',t)}/></View>
        <View style={{flex:0.7}}><PremiumInput icon={Info} iconColor={P.violet} placeholder="C.P." value={String(formData.codigo_postal||'')} onChangeText={t=>setField('codigo_postal',t)} keyboardType="numeric"/></View>
        </View>
        <PremiumInput icon={MapPin} iconColor={P.violet} placeholder="Estado" value={formData.estado} onChangeText={t=>setField('estado',t)}/>
        </View>

        <SectionHead num="04" label="Información Médica" icon={Heart} color={P.rose}/>
        <View style={s.cardModal}>
        <StyledPicker icon={Droplet} iconColor={P.rose} value={formData.tipo_sangre}
        onValueChange={(v:any)=>{setField('tipo_sangre',v);if(fieldErrors['tipo_sangre'])setFieldErrors(p=>{const n={...p};delete n['tipo_sangre'];return n;});}}
        error={fieldErrors['tipo_sangre']}>
        <Picker.Item label="Tipo de sangre…" value="" color={P.slateLight}/>
        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t=><Picker.Item key={t} label={t} value={t} color={P.slate}/>)}
        </StyledPicker>
        <View style={s.div}/>
        <ChipField icon={AlertTriangle} iconColor={P.amber} label="Alergias" labelColor={P.amber} placeholder="Añadir…" items={alergiasEdit} onAdd={(v:any)=>addChip(alergiasEdit,setAlergiasEdit,v)} onRemove={(i:any)=>delChip(alergiasEdit,setAlergiasEdit,i)} chipColor={P.amber} chipBg={P.amberLight} chipBorder="#fde68a"/>
        <View style={s.div}/>
        <ChipField icon={Activity} iconColor={P.teal} label="Enfermedades" labelColor={P.teal} placeholder="Añadir…" items={enfermedadesEdit} onAdd={(v:any)=>addChip(enfermedadesEdit,setEnfermedadesEdit,v)} onRemove={(i:any)=>delChip(enfermedadesEdit,setEnfermedadesEdit,i)} chipColor={P.tealDark} chipBg={P.tealSoft} chipBorder={P.tealLight}/>
        <View style={s.div}/>
        <ChipField icon={Pill} iconColor={P.violet} label="Medicamentos" labelColor={P.violet} placeholder="Añadir…" items={medicamentosEdit} onAdd={(v:any)=>addChip(medicamentosEdit,setMedicamentosEdit,v)} onRemove={(i:any)=>delChip(medicamentosEdit,setMedicamentosEdit,i)} chipColor={P.violet} chipBg={P.violetLight} chipBorder="#ddd6fe"/>
        </View>

        <SectionHead num="05" label="Emergencias" icon={Shield} color={P.amber}/>
        <View style={s.cardModal}>
        <PremiumInput icon={User}  iconColor={P.amber} placeholder="Nombre del contacto" value={formData.contacto_emergencia} onChangeText={t=>setField('contacto_emergencia',t)}/>
        <PremiumInput icon={Phone} iconColor={P.amber} placeholder="Teléfono de emergencia" value={formData.telefono_emergencia} onChangeText={t=>setField('telefono_emergencia',t)} keyboardType="phone-pad"/>
        </View>

        {notif && (
            <View style={s.notif}>
            <View style={s.notifIco}><Info color={P.rose} size={14} strokeWidth={2.5}/></View>
            <Text style={s.notifT}>{notif}</Text>
            </View>
        )}

        <TouchableOpacity onPress={guardarEdicion} activeOpacity={0.87} style={s.btn}>
        <View style={s.btnRow}>
        <CheckCircle color={P.white} size={16} strokeWidth={2.5}/>
        <Text style={s.btnT}>Guardar Cambios</Text>
        </View>
        </TouchableOpacity>

        </ScrollView>
        </KeyboardAvoidingView>
        </Modal>

        </View>

        {successMsg && (
            <SuccessModal title={successMsg.title} message={successMsg.desc} icon={successMsg.icon} color={successMsg.color} onDone={()=>setSuccessMsg(null)}/>
        )}
        </KeyboardAvoidingView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container:{ flex:1, backgroundColor:P.bg },
    content:{ paddingHorizontal:16, paddingTop:8, paddingBottom:64 },

    // Header
    header:{ backgroundColor:P.white, borderRadius:24, marginHorizontal:16, marginTop:16, marginBottom:14, overflow:'hidden', borderWidth:1, borderColor:P.border, shadowColor:'#000', shadowOpacity:0.07, shadowRadius:18, shadowOffset:{width:0,height:6}, elevation:4 },
    headerBar:{ height:4, backgroundColor:P.teal },
    headerBody:{ flexDirection:'row', alignItems:'center', padding:16, gap:14 },
    iconRing:{ width:54, height:54, borderRadius:27, backgroundColor:P.tealSoft, borderWidth:2, borderColor:P.tealLight, alignItems:'center', justifyContent:'center' },
    eye:{ fontSize:9, fontWeight:'800', color:P.teal, letterSpacing:2.5, marginBottom:2 },
    title:{ fontSize:20, fontWeight:'800', color:P.slate, letterSpacing:-0.5 },
    sub:{ fontSize:11, color:P.slateMid, marginTop:1 },
    refreshBtn:{ width:38, height:38, borderRadius:19, backgroundColor:P.tealSoft, borderWidth:1.5, borderColor:P.tealLight, alignItems:'center', justifyContent:'center' },

    statsRow:{ flexDirection:'row', gap:8, paddingHorizontal:16, paddingBottom:10, flexWrap:'wrap' },
    statPill:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:P.tealSoft, paddingHorizontal:10, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor:P.tealLight },
    statPillT:{ fontSize:11, fontWeight:'700', color:P.tealDark },

    searchWrap:{ paddingHorizontal:16, paddingBottom:16 },
    searchBox:{ flexDirection:'row', alignItems:'center', backgroundColor:P.surfaceAlt, borderRadius:14, paddingHorizontal:14, paddingVertical:11, borderWidth:1.5 },
    searchInput:{ flex:1, fontSize:14, color:P.slate, outlineStyle:'none' },

    // Separador alfabético
    letraSep:{ flexDirection:'row', alignItems:'center', marginTop:14, marginBottom:10, gap:10 },
    letraBadge:{ width:32, height:32, borderRadius:16, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
    letraTxt:{ fontSize:16, fontWeight:'900' },
    letraLinea:{ flex:1, height:1.5, backgroundColor:P.border, borderRadius:1 },

    // Empty state
    emptyState:{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40, gap:12 },
    emptyIcon:{ width:80, height:80, borderRadius:40, backgroundColor:P.surfaceAlt, borderWidth:1.5, borderColor:P.border, alignItems:'center', justifyContent:'center', marginBottom:4 },
    emptyTitle:{ fontSize:18, fontWeight:'800', color:P.slate, textAlign:'center' },
    emptyDesc:{ fontSize:13, color:P.slateMid, textAlign:'center', lineHeight:19 },
    emptyBtn:{ backgroundColor:P.tealSoft, borderWidth:1.5, borderColor:P.tealLight, borderRadius:12, paddingHorizontal:20, paddingVertical:10, marginTop:4 },
    emptyBtnT:{ color:P.tealDark, fontWeight:'700', fontSize:13 },

    // Modal header
    modalHeader:{ backgroundColor:P.white, borderBottomWidth:1, borderBottomColor:P.border, overflow:'hidden' },
    modalHeaderBar:{ height:4, backgroundColor:P.teal },
    modalHeaderBody:{ flexDirection:'row', alignItems:'center', padding:16, gap:12 },
    modalIconWrap:{ width:38, height:38, borderRadius:19, backgroundColor:P.tealSoft, borderWidth:1.5, borderColor:P.tealLight, alignItems:'center', justifyContent:'center' },
    modalTitle:{ fontSize:17, fontWeight:'800', color:P.slate },
    modalSub:{ fontSize:12, color:P.slateMid, marginTop:1 },
    modalClose:{ width:34, height:34, borderRadius:17, backgroundColor:P.surfaceAlt, borderWidth:1, borderColor:P.border, alignItems:'center', justifyContent:'center' },

    // Card modal
    cardModal:{ backgroundColor:P.white, borderRadius:20, padding:14, marginBottom:16, borderWidth:1, borderColor:P.border, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:10, shadowOffset:{width:0,height:3}, elevation:2 },

    micro:{ fontSize:10, fontWeight:'700', color:P.slateMid, letterSpacing:0.8, textTransform:'uppercase', marginBottom:5 },
    gRow:{ flexDirection:'row', gap:10, marginBottom:4 },
    gBtn:{ flex:1, paddingVertical:12, borderRadius:13, borderWidth:1.5, borderColor:P.border, backgroundColor:P.surfaceAlt, alignItems:'center' },
    gBtnOn:{ backgroundColor:P.tealSoft, borderColor:P.teal },
    gTxt:{ fontSize:14, fontWeight:'600', color:P.slateMid },
    gTxtOn:{ color:P.tealDark, fontWeight:'700' },

    div:{ height:1, backgroundColor:P.border, marginVertical:8 },

    notif:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#fff1f2', borderRadius:14, padding:12, marginBottom:14, borderWidth:1.5, borderColor:'#fecdd3' },
    notifIco:{ width:32, height:32, borderRadius:16, backgroundColor:'#ffe4e6', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#fecdd3' },
    notifT:{ color:'#be123c', fontSize:13, fontWeight:'600', flex:1, lineHeight:18 },

    btn:{ backgroundColor:P.teal, borderRadius:16, paddingVertical:14, marginBottom:12, shadowColor:P.teal, shadowOpacity:0.3, shadowRadius:14, shadowOffset:{width:0,height:6}, elevation:6 },
    btnRow:{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
    btnT:{ color:P.white, fontSize:15, fontWeight:'700', letterSpacing:0.3 },
});
