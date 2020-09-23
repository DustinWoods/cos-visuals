type fn = (options: {
  beat: number,
  noteProgress: number,
  noteDuration: number,
  phraseProgress: number,
  phraseDuration: number,
  pitch?: number | null,
  isTremelo?: boolean,
  isCrescendo?: boolean
}) => number;

export type MotionFn = {
  x?: fn,
  y?: fn,
  t?: fn,
}

// x is -inf to +inf
// returns -1 to 1
const zeroToOneExp = (x) => {
  if(x < 0) return 1-(1/(1+x));
  return -1-(1/(-1-x));
};

export const gongMotion: MotionFn = {
  x: ({isCrescendo, phraseProgress, phraseDuration, noteProgress, noteDuration}) => {
    // Decaying after note played
    if(noteProgress > noteDuration) return 0;
    const noteI = noteProgress / noteDuration;
    // Increase intensity over phrase
    if(isCrescendo) {
      const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
      return Math.cos(100 * Math.pow(noteI * Math.PI, 0.5)) * (progressi) * 2;
    }
    // Decrease intensity over phrase
    return Math.cos(100 * Math.pow(noteI * Math.PI, 0.5)) * (1-noteI) * 2;
  },
  y: ({isCrescendo, phraseProgress, phraseDuration, noteProgress, noteDuration}) => {
    // Decaying after note played
    if(noteProgress > noteDuration) return 0;
    const noteI = noteProgress / noteDuration;
    // Increase intensity over phrase
    if(isCrescendo) {
      const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
      return Math.cos(100 * Math.pow(noteI * Math.PI * 3 + 0.5, 0.5)) * (progressi) * 2;
    }
    // Decrease intensity over phrase
    return Math.cos(100 * Math.pow(noteI * Math.PI * 3 + 0.5, 0.5)) * (1-noteI) * 2;
  },
};

export const suspCymbMotion: MotionFn = {
  t: ({isCrescendo, phraseProgress, phraseDuration, noteProgress, noteDuration}) => {
    const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
    // Decaying after note played
    if(noteProgress > noteDuration) return Math.cos(100 * noteProgress) * Math.PI * (1/(noteProgress - noteDuration + 1)) / 32;
    const noteI = noteProgress / noteDuration;
    // Increasing intensity over note
    if(!isCrescendo) return Math.cos(100 * Math.pow(noteI * Math.PI, 0.5)) * Math.PI * (1-noteI) / 8;
    // Increasing intensity over phrase
    return Math.cos(100 * Math.pow(noteI * Math.PI, 0.5)) * Math.PI * (progressi) / 8;
  },
};

export const timpaniMotion: MotionFn = {
  y: ({noteProgress, isTremelo, noteDuration, isCrescendo, phraseProgress, phraseDuration}) => {
    const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
    // No decay animation
    if(noteProgress > noteDuration) return 0;
    // drum roll
    if(isTremelo) {
      if(isCrescendo) {
        return (Math.abs(Math.cos(noteProgress * Math.PI * 3))) * 2 * (1 + progressi * 2);
      }
      return (Math.abs(Math.cos(noteProgress * Math.PI * 3))) * 4;
    }
    // single hit
    if(isCrescendo) {
      return (1-(noteProgress/ noteDuration)) * 2 * (1 + progressi * 2);
    }
    return (1-(noteProgress/ noteDuration)) * 5;
  },
};

export const hornMotion: MotionFn = {
  x: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.sin(beat * Math.PI * 2 / 6) * 2 * intensitySwing;
  },
  y: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 2 / 6) * 5 * intensitySwing ;
  },
  t: ({beat, noteDuration, phraseProgress, phraseDuration, isCrescendo,noteProgress}) => {

    let hitT = 0;
    // No decay animation
    if(noteProgress <= noteDuration) {
      // single hit
      if(isCrescendo) {
        const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
        hitT = Math.sin(Math.PI*(noteProgress/ noteDuration)) * Math.PI/48 * (1 + progressi * 2);
      } else {
        hitT = Math.sin(Math.PI*(noteProgress/ noteDuration)) * Math.PI/64;
      }
    }

    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 2 / 6) * Math.PI/64 * intensitySwing - Math.PI/32 - hitT;
  },
};

export const hornDownMotion: MotionFn = {
  x: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.sin(beat * Math.PI * 2 / 6) * 2 * intensitySwing;
  },
  y: ({beat, noteDuration, phraseProgress, phraseDuration, isCrescendo,noteProgress}) => {
    let hitY = 0;
    // No decay animation
    if(noteProgress <= noteDuration) {
      // single hit
      if(isCrescendo) {
        const progressi = Math.min(1, Math.max(0, phraseProgress / phraseDuration));
        hitY = Math.sin(Math.PI*(noteProgress/ noteDuration)) * (1 + progressi * 2);
      } else {
        hitY = Math.sin(Math.PI*(noteProgress/ noteDuration)) * 2;
      }
    }

    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 2 / 6) * 5 * intensitySwing + hitY;
  },
  t: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 2 / 6) * Math.PI/64 * intensitySwing + Math.PI/32;
  },
};

export const fluteMotion: MotionFn = {
  x: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.sin(beat * Math.PI * 4 / 6) * 2 * intensitySwing;
  },
  y: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 4 / 6) * 5 * intensitySwing ;
  },
  t: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return -Math.cos(beat * Math.PI * 2 / 6) * Math.PI/64 * intensitySwing //- hitY;
  },
};



export const bassMotion: MotionFn = {
  t: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return Math.PI / 10 + Math.sin(beat * Math.PI * 2 / 4) * intensitySwing * Math.PI / 100;
  },
  x: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return Math.sin(Math.sin(beat * Math.PI * 2 / 4) * intensitySwing * Math.PI / 100) * 100;
  },
};

export const violinMotion: MotionFn = {
  x: ({beat, noteDuration}) => {
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    return Math.sin(beat * Math.PI * 2 / 4) * 4 * intensitySwing;
  },
  t: ({noteProgress, isTremelo, noteDuration, isCrescendo, phraseProgress}) => {
    if(noteProgress > noteDuration) return Math.PI / 2.5;
    const noteI = noteProgress / noteDuration;
    const intensitySwing = (Math.max(0.5, Math.min(3, noteDuration)) / 3);
    if(isTremelo) {
      return Math.PI / 2.5 + 0.5 * (Math.cos(noteProgress * Math.PI * 6) - 1) * Math.PI / 60;
    }
    return Math.PI / 2.5 + intensitySwing * (Math.cos(noteI * Math.PI * 2) - 1) * Math.PI / 60;
  },
}

