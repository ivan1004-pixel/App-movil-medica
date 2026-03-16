import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, StatusBar, ScrollView, Dimensions, Platform
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── RUTAS DE TUS PANTALLAS (Asegúrate de que estas carpetas existan) ──────────
import Registro from './src/pages/Registro';
import ListaPacientes from './src/pages/ListaPacientes';

// ── ÍCONOS ───────────────────────────────────────────────────────────────────
import {
  Stethoscope, UserPlus, Users, Activity,
  Heart, Shield, ChevronRight, Zap, ChevronLeft
} from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

// ── PALETA PREMIUM ───────────────────────────────────────────────────────────
const P = {
  bg:         '#f0ede8',
  bgWarm:     '#f7f4f0',
  surface:    '#ffffff',
  surfaceAlt: '#faf8f5',
  border:     '#e2ddd7',
  teal:       '#0d9488',
  tealLight:  '#ccfbf1',
  tealMid:    '#5eead4',
  tealDark:   '#0f766e',
  tealSoft:   '#f0fdfa',
  rose:       '#e11d48',
  amber:      '#d97706',
  violet:     '#7c3aed',
  slate:      '#1e293b',
  slateMid:   '#64748b',
  slateLight: '#94a3b8',
  white:      '#ffffff',
};

// 🔥 TEMA PERSONALIZADO PARA MATAR EL FONDO BLANCO
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: P.bg, // Forzamos a que el fondo base sea tu beige
  },
};

// ── COMPONENTES DE TARJETA ───────────────────────────────────────────────────
const PrimaryCard = ({ mod, onPress, shimmerBg }: any) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const Icon = mod.icon;

  const onPressIn = () => Animated.spring(cardScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
    <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} activeOpacity={1}>
    <Animated.View style={[h.cardPrimary, { backgroundColor: shimmerBg }]}>
    <View style={h.cardPrimaryDecor1} />
    <View style={h.cardPrimaryDecor2} />
    <View style={h.cardPrimaryLeft}>
    <View style={h.cardPrimaryIconWrap}>
    <Icon color={P.white} size={28} strokeWidth={1.8} />
    </View>
    <View style={{ flex: 1 }}>
    <Text style={h.cardPrimaryLabel}>{mod.label}</Text>
    <Text style={h.cardPrimaryDesc}>{mod.desc}</Text>
    </View>
    </View>
    <View style={h.cardPrimaryArrow}>
    <ChevronRight color={P.white} size={20} strokeWidth={2.5} />
    </View>
    </Animated.View>
    </TouchableOpacity>
    </Animated.View>
  );
};

const SecondaryCard = ({ mod, onPress }: any) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const Icon = mod.icon;

  const onPressIn = () => Animated.spring(cardScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
    <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} activeOpacity={1}>
    <View style={[h.cardSecondary, { backgroundColor: mod.bg, borderColor: mod.border }]}>
    <View style={[h.cardSecondaryIconWrap, { backgroundColor: mod.color + '18', borderColor: mod.color + '30' }]}>
    <Icon color={mod.color} size={26} strokeWidth={1.8} />
    </View>
    <View style={{ flex: 1 }}>
    <Text style={[h.cardSecondaryLabel, { color: mod.color }]}>{mod.label}</Text>
    <Text style={h.cardSecondaryDesc}>{mod.desc}</Text>
    </View>
    <View style={[h.cardSecondaryArrow, { backgroundColor: mod.color + '15', borderColor: mod.color + '30' }]}>
    <ChevronRight color={mod.color} size={16} strokeWidth={2.5} />
    </View>
    </View>
    </TouchableOpacity>
    </Animated.View>
  );
};

// ── PANTALLA DE INICIO ───────────────────────────────────────────────────────
function HomeScreen({ navigation }: any) {
  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOp     = useRef(new Animated.Value(0)).current;
  const titleY     = useRef(new Animated.Value(24)).current;
  const titleOp    = useRef(new Animated.Value(0)).current;
  const cardsOp    = useRef(new Animated.Value(0)).current;
  const cardsY     = useRef(new Animated.Value(30)).current;
  const footerOp   = useRef(new Animated.Value(0)).current;
  const pulse      = useRef(new Animated.Value(1)).current;
  const ring1      = useRef(new Animated.Value(1)).current;
  const ring1Op    = useRef(new Animated.Value(0.5)).current;
  const ring2      = useRef(new Animated.Value(1)).current;
  const ring2Op    = useRef(new Animated.Value(0.3)).current;
  const shimmer    = useRef(new Animated.Value(0)).current;
  const floatY     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
                        Animated.timing(logoOp,    { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY,  { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.timing(titleOp, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardsY,  { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.timing(cardsOp, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      Animated.timing(footerOp, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
                        Animated.timing(pulse, { toValue: 1,    duration: 1800, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -6, duration: 2400, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
                        Animated.timing(floatY, { toValue: 0,  duration: 2400, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      ])
    ).start();

    const rippleLoop = Animated.loop(
      Animated.stagger(700, [
        Animated.parallel([
          Animated.timing(ring1,   { toValue: 1.8, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                          Animated.timing(ring1Op, { toValue: 0,   duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring2,   { toValue: 1.8, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                          Animated.timing(ring2Op, { toValue: 0,   duration: 1800, useNativeDriver: true }),
        ]),
      ])
    );
    setTimeout(() => rippleLoop.start(), 600);

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sine), useNativeDriver: false }),
                        Animated.timing(shimmer, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sine), useNativeDriver: false }),
      ])
    ).start();

    return () => rippleLoop.stop();
  }, []);

  const shimmerBg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [P.teal, P.tealDark],
  });

  const MODULES = [
    { key: 'Registro', icon: UserPlus, label: 'Nuevo Expediente', desc: 'Registra un nuevo paciente en el sistema clínico', color: P.teal, primary: true },
    { key: 'ListaPacientes', icon: Users, label: 'Directorio Médico', desc: 'Consulta, edita y gestiona todos los expedientes', color: P.violet, bg: '#f5f3ff', border: '#ddd6fe', primary: false },
  ];

  const STATS = [
    { icon: Heart,    label: 'Seguro',    val: '100%', color: P.rose },
    { icon: Zap,      label: 'Rápido',    val: 'v3.0', color: P.amber },
    { icon: Activity, label: 'En línea',  val: '24/7', color: P.teal },
    { icon: Shield,   label: 'Protegido', val: 'SSL',  color: P.violet },
  ];

  return (
    <View style={h.container}>
    <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

    <View style={h.bgDecor1} />
    <View style={h.bgDecor2} />
    <View style={h.bgDecor3} />

    <ScrollView
    contentContainerStyle={h.scroll}
    showsVerticalScrollIndicator={false}
    bounces
    >
    <View style={h.hero}>
    <Animated.View style={[h.logoArea, { transform: [{ translateY: floatY }] }]}>
    <Animated.View style={[h.ring, { transform:[{scale:ring1}], opacity:ring1Op }]} />
    <Animated.View style={[h.ring, h.ring2, { transform:[{scale:ring2}], opacity:ring2Op }]} />
    <Animated.View style={[h.logoWrap, { opacity: logoOp, transform: [{ scale: logoScale }] }]}>
    <View style={h.logoOuter}>
    <View style={h.logoInner}>
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
    <Stethoscope color={P.white} size={38} strokeWidth={1.8} />
    </Animated.View>
    </View>
    </View>
    </Animated.View>
    </Animated.View>

    <Animated.View style={[h.titleBlock, { opacity: titleOp, transform:[{ translateY: titleY }] }]}>
    <Text style={h.eyebrow}>SISTEMA CLÍNICO</Text>
    <Text style={h.mainTitle}>MedSystem</Text>
    <Text style={h.subtitle}>Gestión de expedientes médicos{'\n'}profesional y segura</Text>
    </Animated.View>

    <Animated.View style={[h.statsRow, { opacity: titleOp }]}>
    {STATS.map(({ icon: Icon, label, val, color }) => (
      <View key={label} style={h.statPill}>
      <Icon color={color} size={11} strokeWidth={2.5} />
      <Text style={[h.statVal, { color }]}>{val}</Text>
      <Text style={h.statLbl}>{label}</Text>
      </View>
    ))}
    </Animated.View>
    </View>

    <Animated.View style={[h.modules, { opacity: cardsOp, transform:[{ translateY: cardsY }] }]}>
    <Text style={h.modulesLabel}>Selecciona un módulo</Text>
    {MODULES.map((mod) =>
      mod.primary ?
      <PrimaryCard key={mod.key} mod={mod} shimmerBg={shimmerBg} onPress={() => navigation.navigate(mod.key)} />
      :
      <SecondaryCard key={mod.key} mod={mod} onPress={() => navigation.navigate(mod.key)} />
    )}
    </Animated.View>

    <Animated.View style={[h.footer, { opacity: footerOp }]}>
    <View style={h.footerLine} />
    <Text style={h.footerText}>IVAN</Text>
    <Text style={h.footerSub}>Todos los expedientes están protegidos</Text>
    </Animated.View>
    </ScrollView>
    </View>
  );
}

const h = StyleSheet.create({
  container: { flex: 1, backgroundColor: P.bg },
  // 🔥 FIX: flexGrow 1 asegura que si la pantalla es alta, no quede fondo blanco abajo
  scroll:    { flexGrow: 1, paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  bgDecor1: { position:'absolute', top:-120, right:-80,  width:320, height:320, borderRadius:160, backgroundColor:P.tealLight, opacity:0.35 },
  bgDecor2: { position:'absolute', bottom:-60, left:-80, width:260, height:260, borderRadius:130, backgroundColor:'#fef3c7',  opacity:0.45 },
  bgDecor3: { position:'absolute', top:'40%', left:'30%',width:180, height:180, borderRadius:90,  backgroundColor:P.violetLight, opacity:0.2 },
  hero:       { alignItems:'center', width:'100%', marginBottom: 36 },
  logoArea:   { alignItems:'center', justifyContent:'center', width:160, height:160, marginBottom: 24 },
  ring:       { position:'absolute', width:120, height:120, borderRadius:60, borderWidth:1.5, borderColor:P.teal },
  ring2:      { borderColor:P.tealMid },
  logoWrap:   { position:'absolute' },
  logoOuter:  { width:110, height:110, borderRadius:55, backgroundColor:P.tealLight, borderWidth:3, borderColor:P.tealMid, alignItems:'center', justifyContent:'center', shadowColor:P.teal, shadowOpacity:0.3, shadowRadius:20, shadowOffset:{width:0,height:0}, elevation:8 },
  logoInner:  { width:82,  height:82,  borderRadius:41, backgroundColor:P.teal, alignItems:'center', justifyContent:'center' },
  titleBlock:  { alignItems:'center', gap:6 },
  eyebrow:     { fontSize:10, fontWeight:'800', color:P.teal, letterSpacing:3, textTransform:'uppercase' },
  mainTitle:   { fontSize:42, fontWeight:'900', color:P.slate, letterSpacing:-1.5, lineHeight:46 },
  subtitle:    { fontSize:14, color:P.slateMid, textAlign:'center', lineHeight:21, marginTop:2 },
  statsRow:    { flexDirection:'row', gap:8, marginTop:20, flexWrap:'wrap', justifyContent:'center' },
  statPill:    { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:P.surface, paddingHorizontal:10, paddingVertical:5, borderRadius:20, borderWidth:1, borderColor:P.border, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:2}, elevation:1 },
  statVal:     { fontSize:11, fontWeight:'800' },
  statLbl:     { fontSize:10, color:P.slateLight, fontWeight:'500' },
  modules:      { width:'100%', gap:14 },
  modulesLabel: { fontSize:11, fontWeight:'800', color:P.slateLight, letterSpacing:1.5, textTransform:'uppercase', marginBottom:2, paddingLeft:2 },
  cardPrimary: { borderRadius:22, padding:20, flexDirection:'row', alignItems:'center', overflow:'hidden', shadowColor:P.teal, shadowOpacity:0.4, shadowRadius:18, shadowOffset:{width:0,height:8}, elevation:8 },
  cardPrimaryDecor1: { position:'absolute', width:140, height:140, borderRadius:70, backgroundColor:'rgba(255,255,255,0.08)', top:-40, right:-20 },
                            cardPrimaryDecor2: { position:'absolute', width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,255,255,0.06)', bottom:-20, left:20 },
                            cardPrimaryLeft:   { flex:1, flexDirection:'row', alignItems:'center', gap:16 },
                            cardPrimaryIconWrap:{ width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,255,255,0.2)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.3)', alignItems:'center', justifyContent:'center' },
                            cardPrimaryLabel:  { fontSize:17, fontWeight:'800', color:P.white, letterSpacing:-0.3 },
                            cardPrimaryDesc:   { fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:2, lineHeight:17 },
                            cardPrimaryArrow:  { width:34, height:34, borderRadius:17, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
                            cardSecondary: { borderRadius:20, padding:18, flexDirection:'row', alignItems:'center', gap:14, borderWidth:1.5, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:3 },
                            cardSecondaryIconWrap: { width:54, height:54, borderRadius:27, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
                            cardSecondaryLabel:    { fontSize:16, fontWeight:'800', letterSpacing:-0.2 },
                            cardSecondaryDesc:     { fontSize:12, color:P.slateMid, marginTop:2, lineHeight:17 },
                            cardSecondaryArrow:    { width:32, height:32, borderRadius:16, borderWidth:1, alignItems:'center', justifyContent:'center' },
                            footer:     { alignItems:'center', marginTop:45, gap:4, width:'100%' },
                            footerLine: { width:40, height:2, backgroundColor:P.border, borderRadius:1, marginBottom:8 },
                            footerText: { fontSize:12, color:P.slateMid, fontWeight:'600', letterSpacing:0.2 },
                            footerSub:  { fontSize:11, color:P.slateLight },
});

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  return (
    // 🔥 Usamos nuestro MyTheme para que el root tenga el color correcto
    <NavigationContainer theme={MyTheme}>
    <Stack.Navigator
    initialRouteName="Home"
    screenOptions={({ navigation }) => ({
      headerStyle:      { backgroundColor: P.white },
      headerTintColor:  P.teal,
      headerTitleStyle: { fontWeight: '800', fontSize: 17, color: P.slate },
      headerShadowVisible: false,
      headerBackTitleVisible: false,
      contentStyle:     { backgroundColor: P.bg }, // Fondo beige para todas las pantallas
      animation:        'slide_from_right',
      headerLeft: ({ canGoBack }) =>
      canGoBack ? (
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: Platform.OS === 'web' ? 20 : 0, marginRight: 15, padding: 5, backgroundColor: P.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: P.border }}
        >
        <ChevronLeft color={P.slate} size={22} strokeWidth={2.5} />
        </TouchableOpacity>
      ) : null
    })}
    >
    <Stack.Screen
    name="Home"
    component={HomeScreen}
    options={{ headerShown: false }}
    />
    <Stack.Screen
    name="Registro"
    component={Registro}
    options={{ title: 'Nuevo Expediente' }}
    />
    <Stack.Screen
    name="ListaPacientes"
    component={ListaPacientes}
    options={{ title: 'Directorio Médico' }}
    />
    </Stack.Navigator>
    </NavigationContainer>
  );
}
