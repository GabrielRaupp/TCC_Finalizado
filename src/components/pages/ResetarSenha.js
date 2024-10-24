import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ResetarSenha.module.css';

const ResetarSenha = () => {
  const { token } = useParams(); 
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar visibilidade da senha
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (!newPassword) {
      setMessage('A nova senha é obrigatória.');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/resetarSenha/${token}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message || 'Senha redefinida com sucesso!');
      } else {
        setMessage(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      setMessage('Erro ao redefinir a senha. Tente novamente.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Alterna entre mostrar e esconder a senha
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Redefinir Senha</h2>
      <form className={styles.form} onSubmit={handleResetPassword}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="newPassword">Nova Senha:</label>
          <div className={styles.passwordWrapper}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'} // Mostra ou esconde a senha
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className={styles.passwordToggleIcon}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '👁️' : '🙈'} {/* Ícone de mostrar/esconder senha */}
            </span>
          </div>
        </div>
        <button className={styles.button} type="submit">Redefinir Senha</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default ResetarSenha;
