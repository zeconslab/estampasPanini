import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { OnboardWelcome } from './OnboardWelcome';
import { OnboardAlbum }   from './OnboardAlbum';
import { OnboardName }    from './OnboardName';
import { OnboardAge }     from './OnboardAge';
import { OnboardReady }   from './OnboardReady';
import { useAlbumStore }  from '../store/useAlbumStore';

const { width: W } = Dimensions.get('window');

interface Props { onComplete: () => void }

type Step = 'welcome' | 'album' | 'name' | 'age' | 'ready';
const STEPS: Step[] = ['welcome', 'album', 'name', 'age', 'ready'];

export function OnboardingFlow({ onComplete }: Props) {
  const setProfile = useAlbumStore(s => s.setProfile);
  const [stepIdx, setStepIdx]     = useState(0);
  const [albumId, setAlbumId]     = useState('mundial-2026');
  const [name,    setName]        = useState('');
  const [age,     setAge]         = useState('');
  const slideX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Animated.timing(slideX, { toValue: -(stepIdx + 1) * W, useNativeDriver: true, duration: 280 }).start(() => {
      setStepIdx(i => i + 1);
    });
  };

  const handleDone = () => {
    setProfile({ albumId, name, age });
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { transform: [{ translateX: slideX }] }]}>
        <View style={styles.page}><OnboardWelcome onNext={goNext} /></View>
        <View style={styles.page}><OnboardAlbum onNext={id => { setAlbumId(id); goNext(); }} /></View>
        <View style={styles.page}><OnboardName onNext={n => { setName(n); goNext(); }} /></View>
        <View style={styles.page}><OnboardAge onNext={a => { setAge(a); goNext(); }} /></View>
        <View style={styles.page}><OnboardReady name={name} onDone={handleDone} /></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  track:     { flexDirection: 'row', width: W * STEPS.length },
  page:      { width: W, flex: 1 },
});
