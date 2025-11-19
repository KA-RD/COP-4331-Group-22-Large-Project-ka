import './VideoBackground.css';
import rouletteVideo from '../assets/roulette_spin.mp4';


function VideoBackground() {
    return (
        <video autoPlay loop muted playsInline className="video-background">
            <source src={rouletteVideo} type='video/mp4' />
        </video>
    );
}

export default VideoBackground;