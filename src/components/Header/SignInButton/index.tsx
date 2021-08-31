import React from 'react';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

const getUnloggedJSX = () => (
  <button className={styles.signInButton} type="button">
    <FaGithub color="#eba417" />
    Sign in with Github
  </button>
);

const getLoggedJSX = () => (
  <button className={styles.signInButton} type="button">
    <FaGithub color="#04d361" />
    Gabriel Noronha
    <FiX color="#737380" className={styles.closeIcon} />
  </button>
);

export function SignInButton() {
  const [ isUsedLoggedIn, setIsUsedLoggedIn ] = useState(true);

  return isUsedLoggedIn 
    ? getLoggedJSX()
    : getUnloggedJSX();
}