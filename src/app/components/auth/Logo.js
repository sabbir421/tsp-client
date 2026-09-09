import Image from 'next/image';
import styles from './auth.module.css';

export default function Logo() {
  return (
    <div className={styles.logoWrap}>
      <Image src="/logo.png" alt="TrueSpace Property" width={200} height={56} className={styles.logo} priority />
    </div>
  );
}
