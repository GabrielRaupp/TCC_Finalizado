import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import session from 'express-session';
import twilio from 'twilio'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', 
  resave: false,
  saveUninitialized: true,
}));

const uri = process.env.MONGODB_URI || "mongodb+srv://Gabriel:qVeyehZk9ydz3eRZ@cluster0.imngu.mongodb.net/myDatabase?retryWrites=true&w=majority";



mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: { w: "majority", j: true }
})
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

  // Configuração Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Número do WhatsApp do Twilio
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Esquema de Horário
const HorarioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  horarios: { type: String, required: true },
  category: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Horario = mongoose.model('Horario', HorarioSchema);

// Esquema de Usuário
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String },
  campus: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }, 
});


const User = mongoose.model('User', userSchema);

// Rota para excluir um horário
app.delete('/horarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHorario = await Horario.findByIdAndDelete(id);

    if (!deletedHorario) {
      return res.status(404).json({ message: 'Horário não encontrado' });
    }

    res.json({ message: 'Horário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir horário:', error);
    res.status(500).json({ message: 'Erro ao excluir horário' });
  }
});

// Rota para obter um horário específico pelo ID
app.get('/horarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findById(id);

    if (!horario) {
      return res.status(404).json({ message: 'Horário não encontrado' });
    }

    res.json(horario);
  } catch (error) {
    console.error('Erro ao obter horário:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para atualizar um horário
app.put('/horarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, horarios, category } = req.body;

    if (!name || !horarios || !category) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const updatedHorario = await Horario.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedHorario) {
      return res.status(404).json({ message: 'Horário não encontrado.' });
    }

    res.json(updatedHorario);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
  try {
    const { username, password, email, telefone, campus } = req.body;

    if (!username || !password || !email || !telefone || !campus) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email, telefone, campus });
    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    req.session.userId = user._id;

    res.json({
      message: 'Usuário logado com sucesso!',
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt 
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rota para obter o perfil do usuário
app.get('/perfil', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Você precisa estar logado para acessar o perfil.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      campus: user.campus
    });
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    res.status(500).json({ message: error.message });
  }
});


// Rota para logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Usuário deslogado com sucesso!' });
  });
});

// Rota para solicitar a redefinição de senha
app.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: 'uihr pxak ltqp wlsh',  
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Redefinição de senha',
      text: `Você está recebendo este email porque você solicitou a redefinição da sua senha.\n\n` +
            `Clique no seguinte link para redefinir sua senha:\n\n` +
            `http://localhost:${PORT}/resetarSenha/${token}\n\n` +
            `Se você não solicitou isso, ignore este email.\n`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${email} com link de redefinição de senha.`); 
    res.json({ message: 'Um link para redefinição de senha foi enviado para seu email.' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error); 
    res.status(500).json({ message: 'Erro interno do servidor. Tente novamente mais tarde.' });
  }
});

// Rota para redefinir a senha
app.post('/resetarSenha/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'A nova senha é obrigatória.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token de redefinição de senha inválido ou expirado.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ message: error.message });
  }
});


// Rota para obter todos os horários do usuário
app.get('/horarios', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Você precisa estar logado para acessar os horários.' });
    }

    const horarios = await Horario.find({ user: req.session.userId });
    const currentDate = new Date();

    const expiredHorarios = horarios.filter(horario => new Date(horario.horarios) < currentDate);
    await Horario.deleteMany({ _id: { $in: expiredHorarios.map(h => h._id) } });

    const validHorarios = await Horario.find({ user: req.session.userId });
    res.json(validHorarios);
  } catch (error) {
    console.error('Erro ao obter horários:', error);
    res.status(500).json({ message: error.message });
  }
});

// Função para enviar mensagens WhatsApp e SMS
async function sendNotification(user, name, horarios) {
  const formattedTime = new Date(horarios).toLocaleString();

  // Mensagem para WhatsApp
  await twilioClient.messages.create({
    body: `Olá ${user.username}, você cadastrou um novo horário: ${name} às ${formattedTime}.`,
    from: twilioWhatsAppNumber,
    to: `whatsapp:${user.telefone}`,
  });

  // Mensagem para SMS
  await twilioClient.messages.create({
    body: `Você tem um compromisso marcado: ${name} às ${formattedTime}.`,
    from: twilioPhoneNumber,
    to: user.telefone,
  });

  console.log(`Notificações enviadas para ${user.username} (${user.telefone}) via WhatsApp e SMS.`);
}

// Função para agendar alerta 1 hora antes
function scheduleOneHourReminder(user, name, horarios) {
  const timeToEvent = new Date(horarios).getTime() - Date.now();
  const oneHourBefore = timeToEvent - 3600000; // 1 hora antes do compromisso

  if (oneHourBefore > 0) {
    setTimeout(async () => {
      const formattedTime = new Date(horarios).toLocaleString();

      await twilioClient.messages.create({
        body: `Olá ${user.username}, lembrete: o horário ${name} começará em 1 hora às ${formattedTime}.`,
        from: twilioWhatsAppNumber,
        to: `whatsapp:${user.telefone}`,
      });

      await twilioClient.messages.create({
        body: `Lembrete: o compromisso ${name} começará em 1 hora às ${formattedTime}.`,
        from: twilioPhoneNumber,
        to: user.telefone,
      });

      console.log(`Lembrete de 1 hora enviado para ${user.username}.`);
    }, oneHourBefore);
  }
}


// Rota para registrar um novo horário
app.post('/horarios', async (req, res) => {
  try {
    const { name, horarios, category } = req.body;

    if (!name || !horarios || !category) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ message: 'Você precisa estar logado para cadastrar um horário.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const newHorario = new Horario({
      name,
      horarios,
      category,
      user: user._id,
    });
    await newHorario.save();

    // Enviar email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Novo horário cadastrado',
      text: `Olá ${user.username},\n\nVocê cadastrou um novo horário: \n\n` +
            `Nome: ${name}\n` +
            `Horário: ${horarios}\n` +
            `Categoria: ${category}\n\n` +
            `Obrigado por usar nosso serviço!`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${user.email} sobre o novo horário.`);

   

    // Retornar resposta de sucesso
    res.status(201).json({ message: 'Horário cadastrado com sucesso e notificações enviadas.' });
  } catch (error) {
    console.error('Erro ao registrar horário:', error);
    res.status(500).json({ message: 'Erro ao registrar horário e enviar notificações.' });
  }
});

// Enviar notificações
await sendNotification(user, name, horarios);
scheduleOneHourReminder(user, name, horarios);
    
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
