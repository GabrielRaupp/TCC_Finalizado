import { Link } from 'react-router-dom'; 
import styles from './SingUp.module.css';

function SingUp() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Bem-vindo!</h1>
      <ul className={styles.opções}>
        <li>
          <Link to="/login" className={styles.Opção}>Já tenho conta</Link>
        </li>
        <li>
          <Link to="/cadastro" className={styles.Opção}>Não tenho conta</Link>
        </li>
      </ul>
    </section>
  );
}

export default SingUp;
