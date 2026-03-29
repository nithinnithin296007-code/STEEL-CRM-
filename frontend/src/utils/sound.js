export const playNotificationSound = (type = 'default') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'reminder') {
      // First beep
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.value = 800;
      gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.2);
      
      // Second beep
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.value = 800;
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
      osc2.start(audioContext.currentTime + 0.3);
      osc2.stop(audioContext.currentTime + 0.5);
      
    } else if (type === 'success') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
    } else if (type === 'alert') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    }
  } catch (err) {
    console.error('Sound error:', err);
  }
};

export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (err) {
      console.error('Notification error:', err);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (err) {
      console.error('Permission error:', err);
    }
  }
};