# Generated by Django 3.1 on 2021-01-25 00:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('puzzle', '0009_auto_20200616_1218'),
    ]

    operations = [
        migrations.AlterField(
            model_name='puzzle',
            name='data',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='solve',
            name='data',
            field=models.JSONField(default=dict),
        ),
    ]
