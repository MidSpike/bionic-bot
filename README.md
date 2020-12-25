# bionic-bot

## Usage:

1. Install https://nodejs.org/en/download/current/

2. Make a Discord Bot: https://discord.com/developers/applications and invite it to your guild.

3. Download this code!

4. Copy the `.env.example` file and rename the copy to `.env`.

5. Edit the `.env` file with the correct information.

6. Add your accounts:
    1. Create a folder called `private` in the root directory of the bot.

    2. Create a file called `mc_accounts.json` inside of the `private` folder.

    3. Place the following inside of the `mc_accounts.json` file:
        1. One account:
            ```json
            [
                {"auth": "mojang", "username": "", "email": "", "password": ""}
            ]
            ```
        2. Two accounts:
            ```json
            [
                {"auth": "mojang", "username": "", "email": "", "password": ""},
                {"auth": "mojang", "username": "", "email": "", "password": ""}
            ]
            ```
        3. Three accounts:
            ```json
            [
                {"auth": "mojang", "username": "", "email": "", "password": ""},
                {"auth": "mojang", "username": "", "email": "", "password": ""},
                {"auth": "mojang", "username": "", "email": "", "password": ""}
            ]
            ```
        The last line ending with a `}` must not have a `,` at the end.
    5. Enter the accounts' information for each line.

7. Start the bot with [start_bot.cmd](start_bot.cmd) or [start_bot_in_wt.cmd](start_bot_in_wt.cmd) (If you have Windows Terminal Installed).

## TODO:

1. Finish this [README.md](README.md) file.
