import styles from './Contact.module.css'
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'



function Contact() {
  return (
    
    <section className={styles.Contact}>
    <h1 className={styles.h1}>
      Relate Bugs
    </h1>
    <ul className={styles.social_list}>
      <li>
        <a href='https://www.facebook.com/?locale=pt_BR'>
          <FaFacebook size={40} /> 
        </a>
      </li>
      <li>
        <a href='https://www.instagram.com/gabriel.raupp17/'>
          <FaInstagram size={40} />
        </a>
      </li>
      <li>
        <a href='https://www.linkedin.com/checkpoint/challenge/AgFw1s0up6YjiwAAAZBLshnxQjlnMVOY525QlcnAvM_jECGIVnmyMp8ifWbemZrPEXKhyxLzOVl0U9LahPvlX0wAryJjSA?ut=3rSFr8wbj9eHk1'>
          <FaLinkedin size={40} /> 
        </a>
      </li>
      <li>
        <a href='https://github.com/GabrielRaupp'>
          <FaGithub size={40} />
        </a>
      </li>
      <li>
          <a href='mailto:gabiraupppimentel@gmail' className={styles.social_link}>
            <FaEnvelope size={40}/>
          </a>
        </li>
    </ul>
  </section>
  )
  }
  
  export default Contact;