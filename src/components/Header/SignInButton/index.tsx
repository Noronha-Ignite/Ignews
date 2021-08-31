import React from 'react';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { signIn, useSession, signOut } from 'next-auth/client';

import styles from './styles.module.scss';

const getUnloggedJSX = () => (
  <button 
    className={styles.signInButton} 
    type="button"
    onClick={() => signIn('github')}
  >
    <FaGithub color="#eba417" />
    Sign in with Github
  </button>
);

const getLoggedJSX = (username: string) => (
  <button 
    className={styles.signInButton} 
    type="button"
    onClick={() => signOut()}
  >
    <FaGithub color="#04d361" />
    { username }
    <FiX color="#737380" className={styles.closeIcon} />
  </button>
);

export function SignInButton() {
  const [session] = useSession();

  return session
    ? getLoggedJSX(session.user.name)
    : getUnloggedJSX();
}