import { Link } from 'react-router-dom'; 
import styles from './SingUp.module.css';

function SingUp() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Bem-vindo!</h1>
      <ul className={styles.options}>
        <li>
          <Link to="/login" className={styles.option}>Já tenho conta</Link>
        </li>
        <li>
          <Link to="/cadastro" className={styles.option}>Não tenho conta</Link>
        </li>
      </ul>
    </section>
  );
}

export default SingUp;