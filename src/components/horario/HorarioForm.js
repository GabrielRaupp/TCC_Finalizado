import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './HorarioForm.module.css';

const HorarioForm = ({ onSubmitSuccess, horarioData }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [emailInvite, setEmailInvite] = useState(''); // Novo estado para o e-mail do convite
  const [horarios, setHorarios] = useState('');
  const [category, setCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (horarioData) {
      setName(horarioData.name);
      setHorarios(horarioData.horarios);
      setCategory(horarioData.category || '');
      setUsername(horarioData.username || '');
    }
  }, [horarioData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !horarios || !category || !emailInvite) {
      setErrorMessage('Todos os campos são obrigatórios');
      return;
    }

    const parsedHorario = new Date(horarios);
    if (isNaN(parsedHorario)) {
      setErrorMessage('Por favor, forneça uma data/hora válida.');
      return;
    }

    try {
      let response;
      const horarioPayload = {
        name,
        horarios: parsedHorario.toISOString(),
        category,
        username,
        emailInvite, // Enviar o e-mail do convite ao backend
      };

      if (horarioData) {
        response = await axios.put(`/horarios/${horarioData._id}`, horarioPayload, {
          withCredentials: true,
        });
      } else {
        response = await axios.post('/horarios', horarioPayload, {
          withCredentials: true,
        });
      }

      setName('');
      setUsername('');
      setEmailInvite(''); // Limpar o e-mail do convite
      setHorarios('');
      setCategory('');
      setErrorMessage('');
      setSuccessMessage('Horário Criado');

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar o horário:', error);
      setErrorMessage('Erro ao salvar o horário. Tente novamente.');
    }
  };

  return (
    <div className={styles.form}>
      <h2>{horarioData ? 'Editar Horário' : 'Novo Horário'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o nome do usuário"
            required
          />
        </div>
        <div>
          <label htmlFor="emailInvite">E-mail do Convite:</label>
          <input
            type="email"
            id="emailInvite"
            value={emailInvite}
            onChange={(e) => setEmailInvite(e.target.value)}
            placeholder="Digite o e-mail para enviar o convite"
            required
          />
        </div>
        <div>
          <label htmlFor="name">Nome do Horário:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome do horário"
            required
          />
        </div>
        <div>
          <label htmlFor="horarios">Horário:</label>
          <input
            type="datetime-local"
            id="horarios"
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="Apresentação">Apresentação</option>
            <option value="Atendimento">Atendimento</option>
            <option value="Atividade">Atividade</option>
            <option value="Evento">Evento</option>
            <option value="Orientação/Co-Orientação">Orientação/Co-Orientação</option>
            <option value="Recuperação">Recuperação</option>
            <option value="Prova">Prova</option>
            <option value="Trabalho">Trabalho</option>
          </select>
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        <button type="submit">{horarioData ? 'Atualizar Horário' : 'Salvar Horário'}</button>
      </form>
    </div>
  );
};

export default HorarioForm;
