import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import schedule from 'node-schedule';
import fs from "fs";
// Файл, в который будет записываться информация
const userDataFile = 'user_data.txt';
const chatId = '-1002073695602'; // Идентификатор чата, не пользователя
//const chatId = '833442414'; // Идентификатор пользователя
const botId = '6532102318';
const token = '6532102318:AAFzimGElCeURo0jbFf90wvc0kpNE2qiRdM';
const bot = new TelegramBot(token, { polling: true });
const BIRTHDAYS_FILE = './birthdays.txt';
let tmp = 0;

bot.onText(/\/info/,testCheck);

bot.on('new_chat_members', handleNewChatMembers);

// Устанавливаем расписание на выполнение каждый час
const job = schedule.scheduleJob({ hour: 8, minute: 30}, () => {
  checkBirthdays();
});
// При старте бота
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(bot.getChat(chatId));
});
//мяукалка
bot.onText(/\/кис-кис/, (msg) => {
  bot.sendMessage(chatId, "Мяу Мяу Мяу");
});

//мяукалка
bot.onText(/\/гав-гав/, (msg) => {
  bot.sendMessage(chatId, "Погавкай мне тут, шутник 🤡");
});

 function handleNewChatMembers(msg) {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;

  // Проверяем, есть ли новые участники в списке
  if (newMembers.length > 0) {
    // Сохраняем идентификатор пользователя, который отправил сообщение
    const addedUserId = newMembers[0].id;
    let counter = 0;
    console.log(addedUserId, botId);

    if (addedUserId == botId) exit;

    // Функция для запроса дня рождения   
    function requestBirthday() {
      bot.sendMessage(chatId, `Привет! Я бот НПК-2. Чтобы я мог поздравить вас в ваш день рождения, укажите свой день рождения в формате дд.мм`);

      // Обработчик для ответа пользователя
      const replyHandler = (response) => {
        // Проверяем, что сообщение пришло от того же пользователя, что и запросил день рождения
        if (response.from.id === addedUserId) {
          const userId = addedUserId;
          const userFirstName = newMembers[0].first_name;
          const userLastName = newMembers[0].last_name || '';
          const userUsername = newMembers[0].username || '';
          const userBirthday = response.text;

          // Проверяем правильность формата даты
          const dateRegex = /^\d{2}\.\d{2}$/;
          if (dateRegex.test(userBirthday)) {
            // Добавляем информацию о новом участнике в файл
            fs.appendFile(
              userDataFile,
              `${userId}: ${userFirstName} ${userLastName} (@${userUsername}) - День рождения: ${userBirthday}\n`,
              (err) => {
                if (err) {
                  console.error('Error writing to file:', err);
                } else {
                  console.log('Data written to file:', userDataFile);
                  bot.sendMessage(chatId, `Спасибо, ${userFirstName}! Ваш день рождения успешно добавлен в список.`);
                }
              }
            );

            // Удаляем обработчик после получения ответа
            bot.removeListener('text', replyHandler);
          } else {
            // Повторно запрашиваем день рождения в случае неправильного формата
            bot.sendMessage(chatId, 'Ой-ой-ой, мне кажется, формат даты неправильный, укажите свой день рождения в формате дд.мм');

            if (counter < 3) {
              counter++;
            } else {
              // Удаляем обработчик после получения ответа
              bot.removeListener('text', replyHandler);
            }

          }
        }
      };

      // Слушаем ответ пользователя
      bot.on('text', replyHandler);
    }

    // Запускаем запрос дня рождения
    requestBirthday();
  }
}

// Функция загрузки дней рождения из файла
function loadBirthdays() {
  const birthdays = fs.readFileSync(BIRTHDAYS_FILE, 'utf-8').split('\n').map(line => line.trim());
  return birthdays.filter(Boolean);
}
async function sendBirthdayGreeting(chatId, userId, lastName, firstName, middleName) {
  if (!userId || !lastName || !firstName || !middleName) {
    console.error('Отсутствуют данные для отправки поздравления.');
    console.log(chatId, userId, lastName, firstName, middleName);
    return;
  }
  const telegramLink = `tg://user?id=${userId || ''}`;
  const message = `Поздравляем с днем рождения [${lastName} ${firstName} ${middleName}](${telegramLink}) ! 🎉`;
  console.log(message);
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(`Failed to send greeting for ${firstName} ${lastName}: ${error}`);
    throw error;
  }
}
async function testSend(chatId, userId, lastName, firstName, middleName, date) {
  if (!userId || !lastName || !firstName || !middleName) {
    console.error('Отсутствуют данные для отправки поздравления.');
    console.log(chatId, userId, lastName, firstName, middleName);
    return;
  }
  const telegramLink = `tg://user?id=${userId || ''}`;
  let  message = '';
  if (userId !== '0') {
     tmp++;
     message = `${tmp} ссылка на [${lastName} ${firstName} ${middleName}](${telegramLink}) ${date} 🎉`;
     console.log(message);

} else {
     message = `нет ссылки на [${lastName} ${firstName} ${middleName}] ${date} 🎉`;
     console.log(message);
}
  
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(`Failed to send greeting for ${firstName} ${lastName}: ${error}`);
    throw error;
  }
}
async function testCheck() {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  const birthdays = loadBirthdays();
  tmp = 0;
  for (const birthdayInfo of birthdays) {
    const [date, userId, lastName, firstName, middleName] = birthdayInfo.split(/\s+/).map(part => part.trim());

    if (date) {
      try {
        await testSend(chatId, userId, lastName, firstName, middleName, date);
        // Задержка в 2 секунды после отправки поздравления
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (error) {
        if (error.message.includes('ETELEGRAM: 429')) {
          // Если ошибка связана с превышением лимита запросов, делаем повторную попытку через указанное время
          const retryAfter = parseInt(error.response.headers['retry-after'] || '10', 10); // По умолчанию 10 секунд
          console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          // Повторяем запрос
          continue;
        }
        console.error(`Failed to send greeting for  ${lastName} ${firstName} ${middleName}: ${error}`);
      }
    } 
  }
}
 async function checkBirthdays() {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  const birthdays = loadBirthdays();

  for (const birthdayInfo of birthdays) {
    const [date, userId, lastName, firstName, middleName] = birthdayInfo.split(/\s+/).map(part => part.trim());

    if (date === today) {
      try {
        await sendBirthdayGreeting(chatId, userId, lastName, firstName, middleName);
        // Задержка в 2 секунды после отправки поздравления
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error.message.includes('ETELEGRAM: 429')) {
          // Если ошибка связана с превышением лимита запросов, делаем повторную попытку через указанное время
          const retryAfter = parseInt(error.response.headers['retry-after'] || '10', 10); // По умолчанию 10 секунд
          console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          // Повторяем запрос
          continue;
        }
        console.error(`Failed to send greeting for ${firstName} ${lastName}: ${error}`);
      }
    }
  }
}

