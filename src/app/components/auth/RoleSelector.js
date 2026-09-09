'use client';

import { ROLE_OPTIONS } from '../../constants';
import styles from './auth.module.css';

const ICONS = {
  user: '👤',
  briefcase: '💼',
  graduation: '🎓',
};

export default function RoleSelector({ selectedRole, onSelect, title = 'Choose Account Type' }) {
  return (
    <div className={styles.roleSection}>
      <p className={styles.roleSectionTitle}>{title}</p>
      <div className={styles.roleGrid}>
        {ROLE_OPTIONS.map((role) => (
          <button
            key={role.value}
            type="button"
            className={`${styles.roleCard} ${selectedRole === role.value ? styles.roleCardSelected : ''}`}
            onClick={() => onSelect(role.value)}
          >
            <div className={styles.roleIcon}>{ICONS[role.icon]}</div>
            <div className={styles.roleInfo}>
              <div className={styles.roleLabel}>{role.label}</div>
              <div className={styles.roleDesc}>{role.description}</div>
            </div>
            {selectedRole === role.value && <span className={styles.roleCheck}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
