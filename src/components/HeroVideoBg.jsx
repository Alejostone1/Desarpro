// HeroVideoBg — fullscreen cinematic video background for the home hero.
// Uses the branded Earth-from-space mp4 (with DesarPro logo + connection arcs
// composited in) and a softer overlay so the embedded brand stays visible.
// If autoplay is blocked, falls back to an animated GIF, then a still poster.

function HeroVideoBg({
  poster = './media/earth-still.jpg',
  src = './media/earth-night.mp4',
  gif = './media/earth-night.gif',
}) {
  const videoRef = React.useRef(null);
  const [loaded, setLoaded] = React.useState(false);
  const [videoFailed, setVideoFailed] = React.useState(false);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setLoaded(true);
    const onError = () => setVideoFailed(true);
    v.addEventListener('loadeddata', onCanPlay);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('error', onError);
    const playAttempt = v.play && v.play();
    if (playAttempt && playAttempt.catch) {
      playAttempt.catch(() => setVideoFailed(true));
    }
    return () => {
      v.removeEventListener('loadeddata', onCanPlay);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('error', onError);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: '#020308',
    }}>
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center center',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 800ms var(--ease-out)',
        }}
      />

      {videoFailed && (
        <img
          src={gif}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
          }}
          onLoad={() => setLoaded(true)}
        />
      )}

      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1200ms var(--ease-out)',
          }}
        >
          <source src={src} type="video/mp4"/>
        </video>
      )}

      {/* Cinematic overlay — softened so the embedded DesarPro logo + arcs stay visible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 90% 75% at 50% 50%, transparent 0%, rgba(2,3,8,0.06) 55%, rgba(2,3,8,0.45) 100%),
          linear-gradient(180deg, rgba(2,3,8,0.40) 0%, rgba(2,3,8,0.05) 25%, rgba(2,3,8,0.15) 60%, rgba(2,3,8,0.78) 100%)
        `,
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(180deg, rgba(34,211,238,0.05) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 40% 55%, rgba(245,158,11,0.06) 0%, transparent 45%)',
        pointerEvents: 'none', mixBlendMode: 'screen',
      }}/>

      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        mixBlendMode: 'overlay', pointerEvents: 'none',
      }}/>
    </div>
  );
}

window.HeroVideoBg = HeroVideoBg;
