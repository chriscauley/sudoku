# Generated by Django 2.2.12 on 2020-06-02 00:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('puzzle', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='puzzle',
            name='flag',
            field=models.CharField(choices=[['new', 'new'], ['needs_constraints', 'needs_constraints'], ['no_puzzle', 'no_puzzle'], ['valid', 'valid']], default='new', max_length=16),
        ),
    ]
