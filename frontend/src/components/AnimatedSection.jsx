import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const AnimatedSection = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '',
  threshold = 0.1,
  id = null
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold, once: true });

  return (
    <section
      id={id}
      ref={ref}
      className={`scroll-animate ${className} ${isVisible ? `animate-${animation}` : 'animate-hidden'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
};

export const AnimatedItem = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '',
  threshold = 0.1 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold, once: true });

  return (
    <div
      ref={ref}
      className={`scroll-animate-item ${className} ${isVisible ? `animate-${animation}` : 'animate-hidden'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
