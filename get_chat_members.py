from telethon.sync import TelegramClient

api_id = '16480718'
api_hash = '3efc0ba68086cc79ac23917ab2dfbb08'
phone_number = '+79046129863'

client = TelegramClient('session_name', api_id, api_hash)

async def get_chat_members():
    await client.start(phone_number)

    # З 'invite_link' ссылкa приглашения в ваш чат npk_2
    invite_link = 'https://t.me/+OfgZh95g8-EzODMy' 
   # invite_link = 'https://t.me/+TLl9qixegKNkZTcy'
    chat = await client.get_entity(invite_link)
    
    members = await client.get_participants(chat)

    # Создаем или открываем файл для записи
    with open('chat_members4.txt', 'w', encoding='utf-8') as file:
        for member in members:
            # Записываем информацию в файл
            file.write(f"{member.id}, {member.username}, {member.first_name}, {member.last_name}\n")

    await client.disconnect()

if __name__ == '__main__':
    client.loop.run_until_complete(get_chat_members())
