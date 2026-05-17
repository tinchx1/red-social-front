"use client";
import React from 'react';
import styles from './EmptyState.module.scss';
import { Button } from '@/components/ui';
import BellIcon from '@/assets/notification-empy.svg?react';
import Link from 'next/link';

/**
 * Empty state for notifications when there are no items
 */
export default function EmptyState() {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.titleMain}>Notificaciones</h2>
      </header>
      <BellIcon className={styles.icon} width={48} height={48} />
      <h3 className={styles.title}>Aún no hay notificaciones</h3>
      <p className={styles.text}>
        Acá encontrarás las notificaciones sobre tu red de contactos, perfil y publicaciones.
      </p>
      <p className={styles.text}>
        Generá contenido para recibir interacciones.
      </p>
      <Link href="/inicio" className={styles.cta}>
        <Button style={{ maxWidth: '340px', width: '100%' }} variant="primary" rounded="medium">Crear publicación</Button>
      </Link>
    </section>
  );
}


