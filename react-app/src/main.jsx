import React from 'react';
import ReactDOM from 'react-dom/client';
import VideoPlayer from './components/VideoPlayer';
import VideoSlider from './components/VideoSlider';
import './styles/main.css';

const mountReactComponents = () => {
  // Single Video Players
  const videoContainers = document.querySelectorAll('.firstshorts-video-react-root');
  videoContainers.forEach(container => {
    const props = JSON.parse(container.dataset.props || '{}');
    const root = ReactDOM.createRoot(container);
    root.render(<VideoPlayer {...props} />);
  });

  // Video Sliders
  const sliderContainers = document.querySelectorAll('.firstshorts-slider-react-root');
  sliderContainers.forEach(container => {
    const props = JSON.parse(container.dataset.props || '{}');
    const root = ReactDOM.createRoot(container);
    root.render(<VideoSlider {...props} />);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactComponents);
} else {
  mountReactComponents();
}
