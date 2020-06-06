# Generated by Django 2.2.12 on 2020-06-05 18:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('puzzle', '0005_solve_valid'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='puzzle',
            options={'ordering': ['-publish_date']},
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('source', models.CharField(default='youtube', max_length=16)),
                ('title', models.CharField(max_length=256)),
                ('external_id', models.CharField(max_length=32)),
                ('description', models.TextField(blank=True, default='')),
                ('puzzle', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='puzzle.Puzzle')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]