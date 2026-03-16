import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    Platform, Animated, StyleSheet, StatusBar, Easing,
    KeyboardAvoidingView,
} from 'react-native';
import { pacientesApi } from '../api/pacientesApi';
import { PacienteForm } from '../interfaces/paciente.interface';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    User, Mail, Phone, MapPin, Activity, Droplet,
    AlertTriangle, Calendar, CheckCircle, Info,
    Home, Heart, Shield, Pill, Stethoscope, Plus, X, UserPlus,
} from 'lucide-react-native';

const P = {
    bg:'#f0ede8',bgWarm:'#f7f4f0',surface:'#ffffff',surfaceAlt:'#faf8f5',
    border:'#e2ddd7',borderFocus:'#0d9488',
    teal:'#0d9488',tealLight:'#ccfbf1',tealMid:'#5eead4',tealDark:'#0f766e',tealSoft:'#f0fdfa',
    rose:'#e11d48',roseLight:'#fff1f2',
    amber:'#d97706',amberLight:'#fffbeb',
    violet:'#7c3aed',violetLight:'#f5f3ff',
    slate:'#1e293b',slateMid:'#64748b',slateLight:'#94a3b8',
    white:'#ffffff',
};

const estadoInicial: PacienteForm = {
    nombre:'',apellido:'',fecha_nacimiento:'',genero:'',
    telefono:'',correo:'',direccion:'',ciudad:'',
    estado:'',codigo_postal:0,tipo_sangre:'',alergias:'',
    enfermedades_cronicas:'',medicamentos:'',
    contacto_emergencia:'',telefono_emergencia:'',
};

// ── CHIP animado ──────────────────────────────────────────────────────────────
const Chip = ({ label, color, bg, border, onRemove }:
{label:string;color:string;bg:string;border:string;onRemove:()=>void}) => {
    const sc = useRef(new Animated.Value(0)).current;
    useEffect(()=>{Animated.spring(sc,{toValue:1,tension:80,friction:7,useNativeDriver:true}).start();},[]);
    const press = ()=>Animated.spring(sc,{toValue:0,tension:80,friction:7,useNativeDriver:true}).start(onRemove);
    return(
        <Animated.View style={[ch.chip,{backgroundColor:bg,borderColor:border,transform:[{scale:sc}]}]}>
        <Text style={[ch.txt,{color}]} numberOfLines={1}>{label}</Text>
        <TouchableOpacity onPress={press} hitSlop={{top:8,bottom:8,left:8,right:8}}>
        <X color={color} size={11} strokeWidth={2.5}/>
        </TouchableOpacity>
        </Animated.View>
    );
};
const ch=StyleSheet.create({
    chip:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:11,paddingVertical:5,borderRadius:20,borderWidth:1,maxWidth:200},
    txt:{fontSize:12,fontWeight:'600',flexShrink:1},
});

// ── CAMPO DE CHIPS ────────────────────────────────────────────────────────────
const ChipField = ({icon:Icon,iconColor,label,labelColor,placeholder,items,onAdd,onRemove,chipColor,chipBg,chipBorder}:any)=>{
    const [val,setVal]=useState('');
    const add=()=>{const t=val.trim();if(t){onAdd(t);setVal('');}};
    return(
        <View style={cf.wrap}>
        <View style={cf.hdr}><Icon color={iconColor} size={12} strokeWidth={2.5}/><Text style={[cf.lbl,{color:labelColor}]}>{label}</Text></View>
        <View style={cf.row}>
        <TextInput style={cf.inp} placeholder={placeholder} placeholderTextColor={P.slateLight} value={val} onChangeText={setVal} onSubmitEditing={add} returnKeyType="done" selectionColor={P.teal}/>
        <TouchableOpacity onPress={add} style={[cf.btn,{backgroundColor:iconColor+'15',borderColor:iconColor+'40'}]}>
        <Plus color={iconColor} size={15} strokeWidth={2.5}/>
        </TouchableOpacity>
        </View>
        {items.length>0&&<View style={cf.chips}>{items.map((it:string,i:number)=><Chip key={`${it}-${i}`} label={it} color={chipColor} bg={chipBg} border={chipBorder} onRemove={()=>onRemove(i)}/>)}</View>}
        </View>
    );
};
const cf=StyleSheet.create({
    wrap:{gap:8},hdr:{flexDirection:'row',alignItems:'center',gap:5},
    lbl:{fontSize:10,fontWeight:'700',letterSpacing:0.8,textTransform:'uppercase'},
    row:{flexDirection:'row',alignItems:'center',gap:8},
    inp:{flex:1,backgroundColor:P.surfaceAlt,borderWidth:1.5,borderColor:P.border,borderRadius:12,paddingHorizontal:13,paddingVertical:10,fontSize:14,color:P.slate,outlineStyle:'none'},
    btn:{width:40,height:40,borderRadius:12,borderWidth:1.5,alignItems:'center',justifyContent:'center'},
    chips:{flexDirection:'row',flexWrap:'wrap',gap:6},
});

// ── INPUT PREMIUM ─────────────────────────────────────────────────────────────
const PremiumInput=({icon:Icon,iconColor=P.slateLight,placeholder,value,onChangeText,keyboardType='default',autoCapitalize='sentences',editable=true,delay=0,error}:any)=>{
    const border=useRef(new Animated.Value(0)).current;
    const sy=useRef(new Animated.Value(12)).current;
    const fa=useRef(new Animated.Value(0)).current;
    const hasVal=!!value,hasErr=!!error;
    useEffect(()=>{Animated.parallel([Animated.timing(sy,{toValue:0,duration:380,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),Animated.timing(fa,{toValue:1,duration:320,delay,useNativeDriver:true})]).start();},[]);
    const onFocus=()=>Animated.spring(border,{toValue:1,useNativeDriver:false}).start();
    const onBlur=()=>Animated.spring(border,{toValue:0,useNativeDriver:false}).start();
    const bc=border.interpolate({inputRange:[0,1],outputRange:[hasErr?P.rose:P.border,P.teal]});
    const bg=border.interpolate({inputRange:[0,1],outputRange:[hasErr?'#fff5f5':P.surface,P.tealSoft]});
    const so=border.interpolate({inputRange:[0,1],outputRange:[0,0.18]});
    return(
        <Animated.View style={{opacity:fa,transform:[{translateY:sy}]}}>
        <Animated.View style={[pi.wrap,{borderColor:hasErr?P.rose:bc,backgroundColor:hasErr?'#fff5f5':bg,shadowColor:P.teal,shadowOpacity:so,shadowRadius:10,shadowOffset:{width:0,height:0}}]}>
        <View style={pi.ico}><Icon color={hasErr?P.rose:hasVal?P.teal:iconColor} size={16} strokeWidth={2}/></View>
        <TextInput style={pi.inp} placeholder={placeholder} placeholderTextColor={P.slateLight} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} editable={editable} onFocus={onFocus} onBlur={onBlur} selectionColor={P.teal}/>
        {hasErr?<View style={pi.badge}><AlertTriangle color={P.rose} size={13} strokeWidth={2.5}/></View>:hasVal?<View style={pi.badge}><CheckCircle color={P.teal} size={13} strokeWidth={2.5}/></View>:null}
        </Animated.View>
        {hasErr&&<View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{error}</Text></View>}
        </Animated.View>
    );
};
const pi=StyleSheet.create({
    wrap:{flexDirection:'row',alignItems:'center',borderWidth:1.5,borderRadius:14,paddingHorizontal:13,paddingVertical:12,elevation:1},
    ico:{marginRight:10},inp:{flex:1,fontSize:15,color:P.slate,outlineStyle:'none'},
    badge:{marginLeft:6,width:18,height:18,alignItems:'center',justifyContent:'center'},
    err:{flexDirection:'row',alignItems:'center',gap:4,marginTop:3,paddingLeft:4},
    errT:{color:P.rose,fontSize:10,fontWeight:'600',flex:1},
});

// ── SECTION HEAD ──────────────────────────────────────────────────────────────
const SectionHead=({num,label,icon:Icon,color=P.teal,delay=0}:any)=>{
    const a=useRef(new Animated.Value(0)).current;
    useEffect(()=>{Animated.timing(a,{toValue:1,duration:460,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();},[]);
    return(
        <Animated.View style={[sh.row,{opacity:a,transform:[{translateX:a.interpolate({inputRange:[0,1],outputRange:[-14,0]})}]}]}>
        <View style={[sh.badge,{backgroundColor:color+'15'}]}><Icon color={color} size={11} strokeWidth={2.5}/><Text style={[sh.num,{color}]}>{num}</Text></View>
        <Text style={[sh.lbl,{color}]}>{label}</Text>
        <View style={[sh.line,{backgroundColor:color+'25'}]}/>
        </Animated.View>
    );
};
const sh=StyleSheet.create({
    row:{flexDirection:'row',alignItems:'center',marginBottom:9,gap:8},
    badge:{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:9,paddingVertical:4,borderRadius:20},
    num:{fontSize:10,fontWeight:'800',letterSpacing:0.5},
    lbl:{fontSize:13,fontWeight:'700',letterSpacing:0.2},
    line:{flex:1,height:1},
});

// ── STYLED PICKER ─────────────────────────────────────────────────────────────
const StyledPicker=({icon:Icon,iconColor=P.teal,value,onValueChange,children,error}:any)=>(
    <View>
    <View style={[sp.wrap,error&&{borderColor:P.rose}]}>
    <Icon color={value?iconColor:P.slateLight} size={16} strokeWidth={2} style={{marginRight:10}}/>
    <Picker selectedValue={value} onValueChange={onValueChange} style={sp.picker} dropdownIconColor={P.slateLight}>{children}</Picker>
    </View>
    {error&&<View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{error}</Text></View>}
    </View>
);
const sp=StyleSheet.create({
    wrap:{flexDirection:'row',alignItems:'center',backgroundColor:P.surfaceAlt,borderWidth:1.5,borderColor:P.border,borderRadius:14,paddingHorizontal:13,paddingVertical:2},
    picker:{flex:1,color:P.slate,backgroundColor:'transparent',borderWidth:0,height:50,outlineStyle:'none'},
});

// ── MODAL DE ÉXITO COMPACTO ───────────────────────────────────────────────────
const SuccessModal=({name,onDone}:{name:string;onDone:()=>void})=>{
    const bdOp=useRef(new Animated.Value(0)).current;
    const cs=useRef(new Animated.Value(0.8)).current;
    const co=useRef(new Animated.Value(0)).current;
    const cks=useRef(new Animated.Value(0)).current;
    const txO=useRef(new Animated.Value(0)).current;
    const txY=useRef(new Animated.Value(10)).current;
    const r1=useRef(new Animated.Value(0.5)).current,r1O=useRef(new Animated.Value(0.7)).current;
    const r2=useRef(new Animated.Value(0.5)).current,r2O=useRef(new Animated.Value(0.5)).current;
    const sh=useRef(new Animated.Value(0)).current;

    useEffect(()=>{
        Animated.timing(bdOp,{toValue:1,duration:260,useNativeDriver:true}).start();
        setTimeout(()=>Animated.parallel([Animated.spring(cs,{toValue:1,tension:65,friction:8,useNativeDriver:true}),Animated.timing(co,{toValue:1,duration:280,useNativeDriver:true})]).start(),60);
        setTimeout(()=>Animated.spring(cks,{toValue:1,tension:80,friction:6,useNativeDriver:true}).start(),320);
        setTimeout(()=>Animated.parallel([Animated.timing(txO,{toValue:1,duration:300,useNativeDriver:true}),Animated.timing(txY,{toValue:0,duration:300,easing:Easing.out(Easing.cubic),useNativeDriver:true})]).start(),500);
        const loop=Animated.loop(Animated.stagger(550,[
            Animated.parallel([Animated.timing(r1,{toValue:1.55,duration:1300,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(r1O,{toValue:0,duration:1300,useNativeDriver:true})]),
                                                  Animated.parallel([Animated.timing(r2,{toValue:1.55,duration:1300,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.timing(r2O,{toValue:0,duration:1300,useNativeDriver:true})]),
        ]));
        const t=setTimeout(()=>loop.start(),380);
        Animated.loop(Animated.sequence([Animated.timing(sh,{toValue:1,duration:1800,easing:Easing.inOut(Easing.sine),useNativeDriver:true}),Animated.timing(sh,{toValue:0,duration:1800,easing:Easing.inOut(Easing.sine),useNativeDriver:true})])).start();
        return()=>{clearTimeout(t);loop.stop();};
    },[]);

    const btnBg=sh.interpolate({inputRange:[0,1],outputRange:[P.teal,P.tealDark]});

    return(
        <Animated.View style={[sm.bd,{opacity:bdOp}]}>
        <Animated.View style={[sm.card,{opacity:co,transform:[{scale:cs}]}]}>
        <View style={sm.topBar}/>
        {/* Círculo + ripples */}
        <View style={sm.circleArea}>
        <Animated.View style={[sm.ring,{transform:[{scale:r1}],opacity:r1O}]}/>
        <Animated.View style={[sm.ring,{transform:[{scale:r2}],opacity:r2O,borderColor:P.tealMid}]}/>
        <Animated.View style={[sm.outer,{transform:[{scale:cks}]}]}>
        <View style={sm.inner}><CheckCircle color={P.white} size={34} strokeWidth={2}/></View>
        </Animated.View>
        </View>
        {/* Texto */}
        <Animated.View style={{opacity:txO,transform:[{translateY:txY}],alignItems:'center',paddingHorizontal:22,gap:6}}>
        <Text style={sm.title}>¡Expediente Guardado!</Text>
        <Text style={sm.name}>{name}</Text>
        <Text style={sm.desc}>Registrado exitosamente en el sistema clínico.</Text>
        <View style={sm.pills}>
        {['Datos ✓','Contacto ✓','Médico ✓'].map(l=>(
            <View key={l} style={sm.pill}><Text style={sm.pillT}>{l}</Text></View>
        ))}
        </View>
        </Animated.View>
        {/* Botón */}
        <Animated.View style={{opacity:txO,width:'100%',paddingHorizontal:20}}>
        <TouchableOpacity onPress={onDone} activeOpacity={0.85}>
        <Animated.View style={[sm.btn,{backgroundColor:btnBg}]}>
        <UserPlus color={P.white} size={15} strokeWidth={2}/>
        <Text style={sm.btnT}>Nuevo Registro</Text>
        </Animated.View>
        </TouchableOpacity>
        </Animated.View>
        </Animated.View>
        </Animated.View>
    );
};
const sm=StyleSheet.create({
    bd:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(15,23,42,0.58)',alignItems:'center',justifyContent:'center',paddingHorizontal:26},
                           card:{backgroundColor:P.white,borderRadius:28,width:'100%',overflow:'hidden',paddingBottom:22,gap:16,alignItems:'center',shadowColor:'#000',shadowOpacity:0.28,shadowRadius:32,shadowOffset:{width:0,height:14},elevation:22},
                           topBar:{height:5,width:'100%',backgroundColor:P.teal},
                           circleArea:{marginTop:26,width:100,height:100,alignItems:'center',justifyContent:'center'},
                           ring:{position:'absolute',width:84,height:84,borderRadius:42,borderWidth:1.5,borderColor:P.teal},
                           outer:{position:'absolute',width:84,height:84,borderRadius:42,backgroundColor:P.tealLight,alignItems:'center',justifyContent:'center',borderWidth:2.5,borderColor:P.tealMid},
                           inner:{width:64,height:64,borderRadius:32,backgroundColor:P.teal,alignItems:'center',justifyContent:'center'},
                           title:{fontSize:20,fontWeight:'800',color:P.slate,letterSpacing:-0.3,textAlign:'center'},
                           name:{fontSize:15,fontWeight:'700',color:P.tealDark,textAlign:'center'},
                           desc:{fontSize:12,color:P.slateMid,textAlign:'center',lineHeight:17},
                           pills:{flexDirection:'row',gap:5,flexWrap:'wrap',justifyContent:'center',marginTop:6},
                           pill:{backgroundColor:P.tealSoft,paddingHorizontal:9,paddingVertical:3,borderRadius:20,borderWidth:1,borderColor:P.tealLight},
                           pillT:{color:P.teal,fontSize:10,fontWeight:'700'},
                           btn:{borderRadius:13,paddingVertical:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},
                           btnT:{color:P.white,fontSize:14,fontWeight:'700',letterSpacing:0.2},
});

// ── CARD con fade-in ──────────────────────────────────────────────────────────
const Card=({children,delay=0}:{children:React.ReactNode;delay?:number})=>{
    const op=useRef(new Animated.Value(0)).current;
    const y=useRef(new Animated.Value(14)).current;
    useEffect(()=>{Animated.parallel([Animated.timing(op,{toValue:1,duration:420,delay,useNativeDriver:true}),Animated.timing(y,{toValue:0,duration:380,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true})]).start();},[]);
    return <Animated.View style={[s.card,{opacity:op,transform:[{translateY:y}]}]}>{children}</Animated.View>;
};

// ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────────
type Contacto={nombre:string;telefono:string};

export default function Registro(){
    const [formData,setFormData]=useState<PacienteForm>({...estadoInicial});
    const [loading,setLoading]=useState(false);
    const [showDatePicker,setShowDatePicker]=useState(false);
    const [dateObj,setDateObj]=useState(new Date(2000,0,1));
    const [alergias,setAlergias]=useState<string[]>([]);
    const [enfermedades,setEnfermedades]=useState<string[]>([]);
    const [medicamentos,setMedicamentos]=useState<string[]>([]);
    const [contactos,setContactos]=useState<Contacto[]>([{nombre:'',telefono:''}]);
    const [registrado,setRegistrado]=useState<string|null>(null);
    const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
    const [notif,setNotif]=useState<string|null>(null);

    const headerY=useRef(new Animated.Value(-22)).current;
    const headerOp=useRef(new Animated.Value(0)).current;
    const headerS=useRef(new Animated.Value(0.95)).current;
    const iconPulse=useRef(new Animated.Value(1)).current;
    const notifShake=useRef(new Animated.Value(0)).current;
    const btnScale=useRef(new Animated.Value(1)).current;

    useEffect(()=>{
        Animated.parallel([Animated.spring(headerS,{toValue:1,tension:52,friction:9,useNativeDriver:true}),Animated.timing(headerOp,{toValue:1,duration:520,useNativeDriver:true}),Animated.timing(headerY,{toValue:0,duration:460,easing:Easing.out(Easing.cubic),useNativeDriver:true})]).start();
        Animated.loop(Animated.sequence([Animated.timing(iconPulse,{toValue:1.07,duration:2000,easing:Easing.inOut(Easing.sine),useNativeDriver:true}),Animated.timing(iconPulse,{toValue:1,duration:2000,easing:Easing.inOut(Easing.sine),useNativeDriver:true})])).start();
    },[]);

    const shake=()=>Animated.sequence([Animated.timing(notifShake,{toValue:7,duration:55,useNativeDriver:true}),Animated.timing(notifShake,{toValue:-7,duration:55,useNativeDriver:true}),Animated.timing(notifShake,{toValue:5,duration:55,useNativeDriver:true}),Animated.timing(notifShake,{toValue:-5,duration:55,useNativeDriver:true}),Animated.timing(notifShake,{toValue:0,duration:55,useNativeDriver:true})]).start();

    const setField=(name:keyof PacienteForm,value:string)=>{
        if(fieldErrors[name])setFieldErrors(p=>{const n={...p};delete n[name];return n;});
        setNotif(null);
        if(name==='codigo_postal'){setFormData(p=>({...p,[name]:parseInt(value)||0}));}
        else if(name==='correo'){setFormData(p=>({...p,[name]:value.toLowerCase().trim()}));}
        else if(name==='nombre'||name==='apellido'){setFormData(p=>({...p,[name]:value?value.toLowerCase().split(' ').map((w:string)=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '):''}));}
        else{setFormData(p=>({...p,[name]:value}));}
    };

    const addChip=(arr:string[],setArr:any,v:string)=>setArr([...arr,v]);
    const delChip=(arr:string[],setArr:any,i:number)=>setArr(arr.filter((_:any,idx:number)=>idx!==i));

    const guardar=async()=>{
        const dominios=['@gmail.com','@yahoo.com','@outlook.com','@hotmail.com','@live.com','@icloud.com'];
        const err:Record<string,string>={};
        if(!formData.nombre)err['nombre']='Nombre requerido.';
        if(!formData.apellido)err['apellido']='Apellido requerido.';
        if(!formData.correo||!dominios.some(d=>formData.correo.endsWith(d)))err['correo']='Correo inválido.';
        if(!formData.telefono||formData.telefono.replace(/\D/g,'').length<10)err['telefono']='Mínimo 10 dígitos.';
        if(!formData.tipo_sangre)err['tipo_sangre']='Selecciona tipo de sangre.';
        if(!formData.genero)err['genero']='Selecciona género.';
        if(Object.keys(err).length>0){setFieldErrors(err);setNotif('Revisa los campos marcados.');shake();return;}
        setFieldErrors({});setNotif(null);

        const payload:PacienteForm={...formData,
            alergias:alergias.join(', '),
            enfermedades_cronicas:enfermedades.join(', '),
            medicamentos:medicamentos.join(', '),
            contacto_emergencia:contactos.map(c=>c.nombre).filter(Boolean).join(' | '),
            telefono_emergencia:contactos.map(c=>c.telefono).filter(Boolean).join(' | '),
        };

        Animated.sequence([Animated.spring(btnScale,{toValue:0.94,useNativeDriver:true}),Animated.spring(btnScale,{toValue:1,useNativeDriver:true})]).start();
        setLoading(true);
        try{
            const query=`mutation CreatePaciente($input: CreatePacienteInput!) { createPaciente(input: $input) { id nombre apellido } }`;
            const res=await pacientesApi.post('',{query,variables:{input:payload}});
            if(res.data.errors){setNotif(res.data.errors[0].message);shake();}
            else{setRegistrado(`${res.data.data.createPaciente.nombre} ${res.data.data.createPaciente.apellido}`);}
        }catch{setNotif('No se pudo conectar con el servidor.');shake();}
        finally{setLoading(false);}
    };

    const reiniciar=()=>{
        setRegistrado(null);setFormData({...estadoInicial});
        setAlergias([]);setEnfermedades([]);setMedicamentos([]);
        setContactos([{nombre:'',telefono:''}]);
        setDateObj(new Date(2000,0,1));setFieldErrors({});setNotif(null);
    };

    const fechaDisplay=formData.fecha_nacimiento?
    (()=>{const d=new Date(formData.fecha_nacimiento+'T12:00:00');return isNaN(d.getTime())?formData.fecha_nacimiento:d.toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'});})():'';

    return(
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <StatusBar barStyle="dark-content" backgroundColor={P.bg}/>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* HEADER */}
        <Animated.View style={[s.header,{opacity:headerOp,transform:[{translateY:headerY},{scale:headerS}]}]}>
        <View style={s.headerBar}/>
        <View style={s.headerBody}>
        <Animated.View style={{transform:[{scale:iconPulse}]}}>
        <View style={s.iconRing}><Stethoscope color={P.teal} size={27} strokeWidth={1.8}/></View>
        </Animated.View>
        <View style={{flex:1}}>
        <Text style={s.eye}>SISTEMA CLÍNICO</Text>
        <Text style={s.title}>Nuevo Expediente</Text>
        <Text style={s.sub}>Registro completo de paciente</Text>
        </View>
        </View>
        <View style={s.stats}>
        {[['5','Secciones'],['15+','Campos'],['100%','Seguro']].map(([v,l])=>(
            <View key={l} style={s.stat}>
            <Text style={s.statV}>{v}</Text><Text style={s.statL}>{l}</Text>
            </View>
        ))}
        </View>
        </Animated.View>

        {/* 01 DATOS PERSONALES */}
        <SectionHead num="01" label="Datos Personales" icon={User} delay={80}/>
        <Card delay={100}>
        <PremiumInput icon={User} placeholder="Nombre(s)" value={formData.nombre} onChangeText={t=>setField('nombre',t)} delay={120} error={fieldErrors['nombre']}/>
        <PremiumInput icon={User} placeholder="Apellidos" value={formData.apellido} onChangeText={t=>setField('apellido',t)} delay={150} error={fieldErrors['apellido']}/>

        {/* Fecha */}
        <View>
        <Text style={s.micro}>Fecha de Nacimiento</Text>
        {Platform.OS==='web'?(
            <View style={[pi.wrap,{borderColor:P.border,backgroundColor:P.surfaceAlt}]}>
            <View style={pi.ico}><Calendar color={formData.fecha_nacimiento?P.teal:P.slateLight} size={16} strokeWidth={2}/></View>
            <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.fecha_nacimiento}
            onChange={e=>setFormData(p=>({...p,fecha_nacimiento:e.target.value}))}
            style={{flex:1,fontSize:15,color:P.slate,border:'none',outline:'none',backgroundColor:'transparent',fontFamily:'inherit',cursor:'pointer',width:'100%'} as any}/>
            {!!formData.fecha_nacimiento&&<View style={pi.badge}><CheckCircle color={P.teal} size={13} strokeWidth={2.5}/></View>}
            </View>
        ):(
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} activeOpacity={0.7}>
            <View style={[pi.wrap,{borderColor:P.border,backgroundColor:P.surfaceAlt}]}>
            <View style={pi.ico}><Calendar color={formData.fecha_nacimiento?P.teal:P.slateLight} size={16} strokeWidth={2}/></View>
            <Text style={[{flex:1,fontSize:15,paddingVertical:0,color:fechaDisplay?P.slate:P.slateLight,outlineStyle:'none'}]}>{fechaDisplay||'Toca para seleccionar'}</Text>
            {!!formData.fecha_nacimiento&&<View style={pi.badge}><CheckCircle color={P.teal} size={13} strokeWidth={2.5}/></View>}
            </View>
            </TouchableOpacity>
        )}
        {showDatePicker&&Platform.OS!=='web'&&(
            <DateTimePicker value={dateObj} mode="date" maximumDate={new Date()}
            display={Platform.OS==='ios'?'spinner':'default'}
            onChange={(_:any,date?:Date)=>{
                if(Platform.OS!=='ios')setShowDatePicker(false);
                if(date){
                    setDateObj(date);
                    const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                    setFormData(p=>({...p,fecha_nacimiento:iso}));
                }
            }}/>
        )}
        {Platform.OS==='ios'&&showDatePicker&&(
            <TouchableOpacity onPress={()=>setShowDatePicker(false)} style={s.iosDone}>
            <Text style={s.iosDoneT}>Listo</Text>
            </TouchableOpacity>
        )}
        </View>

        {/* Género toggle */}
        <View>
        <Text style={s.micro}>Género</Text>
        <View style={s.gRow}>
        {['Hombre','Mujer'].map(g=>{
            const on=formData.genero===g;
            return(
                <TouchableOpacity key={g} onPress={()=>setField('genero',g)} activeOpacity={0.8}
                style={[s.gBtn,on&&s.gBtnOn,fieldErrors['genero']&&!on&&{borderColor:P.rose+'80'}]}>
                <Text style={[s.gTxt,on&&s.gTxtOn]}>{g==='Hombre'?'♂ Hombre':'♀ Mujer'}</Text>
                </TouchableOpacity>
            );
        })}
        </View>
        {fieldErrors['genero']&&<View style={pi.err}><Info color={P.rose} size={10} strokeWidth={2.5}/><Text style={pi.errT}>{fieldErrors['genero']}</Text></View>}
        </View>
        </Card>

        {/* 02 CONTACTO */}
        <SectionHead num="02" label="Contacto Rápido" icon={Phone} color={P.tealDark} delay={200}/>
        <Card delay={220}>
        <PremiumInput icon={Phone} iconColor={P.tealDark} placeholder="Teléfono (10 dígitos)" value={formData.telefono} onChangeText={t=>setField('telefono',t)} keyboardType="phone-pad" autoCapitalize="none" delay={240} error={fieldErrors['telefono']}/>
        <PremiumInput icon={Mail} iconColor={P.tealDark} placeholder="Correo electrónico" value={formData.correo} onChangeText={t=>setField('correo',t)} keyboardType="email-address" autoCapitalize="none" delay={260} error={fieldErrors['correo']}/>
        </Card>

        {/* 03 UBICACIÓN */}
        <SectionHead num="03" label="Ubicación" icon={MapPin} color={P.violet} delay={300}/>
        <Card delay={320}>
        <PremiumInput icon={Home} iconColor={P.violet} placeholder="Dirección completa" value={formData.direccion} onChangeText={t=>setField('direccion',t)} delay={340}/>
        <PremiumInput icon={MapPin} iconColor={P.violet} placeholder="Ciudad" value={formData.ciudad} onChangeText={t=>setField('ciudad',t)} delay={360}/>
        <PremiumInput icon={MapPin} iconColor={P.violet} placeholder="Estado / Provincia" value={formData.estado} onChangeText={t=>setField('estado',t)} delay={380}/>
        <PremiumInput icon={Info} iconColor={P.violet} placeholder="Código Postal" value={formData.codigo_postal===0?'':String(formData.codigo_postal)} onChangeText={t=>setField('codigo_postal',t)} keyboardType="numeric" autoCapitalize="none" delay={400}/>
        </Card>

        {/* 04 MÉDICA */}
        <SectionHead num="04" label="Información Médica" icon={Heart} color={P.rose} delay={420}/>
        <Card delay={440}>
        <StyledPicker icon={Droplet} iconColor={P.rose} value={formData.tipo_sangre}
        onValueChange={(v:string)=>{setField('tipo_sangre',v);if(fieldErrors['tipo_sangre'])setFieldErrors(p=>{const n={...p};delete n['tipo_sangre'];return n;});}}
        error={fieldErrors['tipo_sangre']}>
        <Picker.Item label="Tipo de sangre…" value="" color={P.slateLight}/>
        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t=><Picker.Item key={t} label={t} value={t} color={P.slate}/>)}
        </StyledPicker>
        {!!formData.tipo_sangre&&(
            <View style={s.bbadge}><Droplet color={P.rose} size={11} strokeWidth={2}/><Text style={s.bbadgeT}>Tipo {formData.tipo_sangre}</Text></View>
        )}
        <View style={s.div}/>
        <ChipField icon={AlertTriangle} iconColor={P.amber} label="Alergias" labelColor={P.amber} placeholder="Ej. Penicilina…" items={alergias} onAdd={(v:string)=>addChip(alergias,setAlergias,v)} onRemove={(i:number)=>delChip(alergias,setAlergias,i)} chipColor={P.amber} chipBg={P.amberLight} chipBorder="#fde68a"/>
        <View style={s.div}/>
        <ChipField icon={Activity} iconColor={P.teal} label="Enfermedades Crónicas" labelColor={P.teal} placeholder="Ej. Diabetes, Asma…" items={enfermedades} onAdd={(v:string)=>addChip(enfermedades,setEnfermedades,v)} onRemove={(i:number)=>delChip(enfermedades,setEnfermedades,i)} chipColor={P.tealDark} chipBg={P.tealSoft} chipBorder={P.tealLight}/>
        <View style={s.div}/>
        <ChipField icon={Pill} iconColor={P.violet} label="Medicamentos Actuales" labelColor={P.violet} placeholder="Ej. Metformina 500mg…" items={medicamentos} onAdd={(v:string)=>addChip(medicamentos,setMedicamentos,v)} onRemove={(i:number)=>delChip(medicamentos,setMedicamentos,i)} chipColor={P.violet} chipBg={P.violetLight} chipBorder="#ddd6fe"/>
        </Card>

        {/* 05 EMERGENCIA */}
        <SectionHead num="05" label="Contactos de Emergencia" icon={Shield} color={P.amber} delay={520}/>
        <Card delay={540}>
        <View style={s.emerBanner}>
        <AlertTriangle color={P.amber} size={13} strokeWidth={2}/>
        <Text style={s.emerBannerT}>Solo se usarán en urgencias médicas</Text>
        </View>
        {contactos.map((ct,i)=>(
            <View key={i} style={s.ctBlock}>
            {contactos.length>1&&(
                <View style={s.ctHdr}>
                <Text style={s.ctNum}>Contacto {i+1}</Text>
                <TouchableOpacity onPress={()=>setContactos(c=>c.filter((_,idx)=>idx!==i))} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                <View style={s.rmBtn}><X color={P.rose} size={11} strokeWidth={2.5}/></View>
                </TouchableOpacity>
                </View>
            )}
            <PremiumInput icon={User} iconColor={P.amber} placeholder="Nombre del contacto" value={ct.nombre} onChangeText={v=>setContactos(c=>c.map((x,idx)=>idx===i?{...x,nombre:v}:x))} delay={0}/>
            <PremiumInput icon={Phone} iconColor={P.amber} placeholder="Teléfono de emergencia" value={ct.telefono} onChangeText={v=>setContactos(c=>c.map((x,idx)=>idx===i?{...x,telefono:v}:x))} keyboardType="phone-pad" autoCapitalize="none" delay={0}/>
            </View>
        ))}
        {contactos.length<3&&(
            <TouchableOpacity onPress={()=>setContactos(c=>[...c,{nombre:'',telefono:''}])} style={s.addCt} activeOpacity={0.75}>
            <UserPlus color={P.amber} size={14} strokeWidth={2}/>
            <Text style={s.addCtT}>Añadir otro contacto</Text>
            </TouchableOpacity>
        )}
        </Card>

        {/* NOTIF */}
        {notif&&(
            <Animated.View style={[s.notif,{transform:[{translateX:notifShake}]}]}>
            <View style={s.notifIco}><Info color={P.rose} size={15} strokeWidth={2.5}/></View>
            <Text style={s.notifT}>{notif}</Text>
            </Animated.View>
        )}

        {/* BOTÓN */}
        <Animated.View style={{transform:[{scale:btnScale}]}}>
        <TouchableOpacity onPress={guardar} disabled={loading} activeOpacity={0.87} style={[s.btn,loading&&s.btnL]}>
        <View style={s.btnRow}>
        {loading?<><Activity color={P.white} size={17} strokeWidth={2}/><Text style={s.btnT}>Procesando…</Text></>:<><CheckCircle color={P.white} size={17} strokeWidth={2.5}/><Text style={s.btnT}>Guardar Expediente</Text></>}
        </View>
        </TouchableOpacity>
        </Animated.View>

        <Text style={s.footer}>IVAN</Text>
        </ScrollView>

        {registrado&&<SuccessModal name={registrado} onDone={reiniciar}/>}
        </KeyboardAvoidingView>
    );
}

const s=StyleSheet.create({
    scroll:{flex:1,backgroundColor:P.bg},
    content:{paddingHorizontal:16,paddingTop:18,paddingBottom:64},
    header:{backgroundColor:P.white,borderRadius:24,marginBottom:22,overflow:'hidden',borderWidth:1,borderColor:P.border,shadowColor:'#000',shadowOpacity:0.07,shadowRadius:18,shadowOffset:{width:0,height:6},elevation:4},
    headerBar:{height:4,backgroundColor:P.teal},
    headerBody:{flexDirection:'row',alignItems:'center',padding:17,gap:14},
    iconRing:{width:56,height:56,borderRadius:28,backgroundColor:P.tealSoft,borderWidth:2,borderColor:P.tealLight,alignItems:'center',justifyContent:'center'},
    eye:{fontSize:9,fontWeight:'800',color:P.teal,letterSpacing:2.5,marginBottom:2},
    title:{fontSize:21,fontWeight:'800',color:P.slate,letterSpacing:-0.5},
    sub:{fontSize:12,color:P.slateMid,marginTop:1},
    stats:{flexDirection:'row',borderTopWidth:1,borderTopColor:P.border},
    stat:{flex:1,alignItems:'center',paddingVertical:9,borderRightWidth:1,borderRightColor:P.border},
    statV:{fontSize:14,fontWeight:'800',color:P.teal},
    statL:{fontSize:9,color:P.slateMid,marginTop:1},
    card:{backgroundColor:P.white,borderRadius:20,padding:14,marginBottom:18,gap:11,borderWidth:1,borderColor:P.border,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:10,shadowOffset:{width:0,height:3},elevation:2},
    micro:{fontSize:10,fontWeight:'700',color:P.slateMid,letterSpacing:0.8,textTransform:'uppercase',marginBottom:4},
    gRow:{flexDirection:'row',gap:10},
    gBtn:{flex:1,paddingVertical:13,borderRadius:13,borderWidth:1.5,borderColor:P.border,backgroundColor:P.surfaceAlt,alignItems:'center'},
    gBtnOn:{backgroundColor:P.tealSoft,borderColor:P.teal},
    gTxt:{fontSize:14,fontWeight:'600',color:P.slateMid},
    gTxtOn:{color:P.tealDark,fontWeight:'700'},
    bbadge:{flexDirection:'row',alignItems:'center',gap:5,alignSelf:'flex-start',backgroundColor:'#fff1f2',paddingHorizontal:10,paddingVertical:4,borderRadius:20,borderWidth:1,borderColor:'#fecdd3'},
    bbadgeT:{color:P.rose,fontSize:12,fontWeight:'700'},
    div:{height:1,backgroundColor:P.border,marginVertical:2},
    emerBanner:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:P.amberLight,borderRadius:10,padding:10,borderWidth:1,borderColor:'#fde68a'},
    emerBannerT:{color:P.amber,fontSize:12,fontWeight:'600',flex:1},
    ctBlock:{gap:8,paddingTop:4},
    ctHdr:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:2},
    ctNum:{fontSize:10,fontWeight:'700',color:P.slateMid,letterSpacing:0.5,textTransform:'uppercase'},
    rmBtn:{width:22,height:22,borderRadius:11,backgroundColor:'#fff1f2',borderWidth:1,borderColor:'#fecdd3',alignItems:'center',justifyContent:'center'},
    addCt:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:11,borderRadius:13,borderWidth:1.5,borderColor:'#fde68a',borderStyle:'dashed',backgroundColor:P.amberLight},
    addCtT:{color:P.amber,fontSize:13,fontWeight:'700'},
    notif:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#fff1f2',borderRadius:14,padding:12,marginBottom:12,borderWidth:1.5,borderColor:'#fecdd3',shadowColor:P.rose,shadowOpacity:0.1,shadowRadius:8,shadowOffset:{width:0,height:3},elevation:2},
    notifIco:{width:32,height:32,borderRadius:16,backgroundColor:'#ffe4e6',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#fecdd3'},
    notifT:{color:'#be123c',fontSize:13,fontWeight:'600',flex:1,lineHeight:18},
    btn:{backgroundColor:P.teal,borderRadius:16,paddingVertical:15,marginBottom:12,shadowColor:P.teal,shadowOpacity:0.32,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:6},
    btnL:{backgroundColor:P.tealMid,shadowOpacity:0},
    btnRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
    btnT:{color:P.white,fontSize:16,fontWeight:'700',letterSpacing:0.3},
    footer:{textAlign:'center',fontSize:11,color:P.slateLight,marginTop:2,letterSpacing:0.3},
    iosDone:{alignSelf:'flex-end',paddingHorizontal:14,paddingVertical:6},
    iosDoneT:{color:P.teal,fontSize:15,fontWeight:'700'},
});
