# Generated by Django 4.0.5 on 2022-06-19 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('puzzle', '0010_auto_20210125_0031'),
    ]

    operations = [
        migrations.AlterField(
            model_name='puzzle',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='solve',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='video',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]