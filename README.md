# Fanatic Badge Reaper

If you sign in to Stack Overflow for 30 consecutive days, you can get `Enthusiast`, a silver badge. If 100 consecutive days, you can get a golden badge `Fanatic`! 

It's hard for me to remember visit the site every day, espectially on weekend. That's why this repo here in.

## Usage

1. Fork this repo.
2. Go into `Actions` tab on your forked repo, and enabled the workflows.
3. Go to `Settings` > `Secrets`, add your login email and password of Stack Overflow as `Repository Secret`, the key must be `FC_EMAIL` and `FC_PASSWORD`.
4. Wait 100 days :)

## Tips

1. Current cron schedule is: `1 */8 * * *`, you can edit it on `.github/workflows/fanatic.yml`. 

2. Please config your Github notification email, so that you can receive failed message from Github Actions.
