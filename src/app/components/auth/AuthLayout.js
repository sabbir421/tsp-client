import Logo from './Logo';
import styles from './auth.module.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Logo />
        {(title || subtitle) && (
          <div className={styles.header}>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
