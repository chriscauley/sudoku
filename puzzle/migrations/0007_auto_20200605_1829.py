# Generated by Django 2.2.12 on 2020-06-05 18:29

from django.db import migrations

def split_videos(apps, schema_editor):
    Puzzle = apps.get_model('puzzle', 'Puzzle')
    Video = apps.get_model('puzzle', 'Video')
    for puzzle in Puzzle.objects.all():
        if not puzzle.video_id:
            print(puzzle.id, 'missing video id')
            continue
        video, new = Video.objects.get_or_create(
            external_id=puzzle.video_id,
            defaults={'title': puzzle.title or ""}
        )
        video.puzzle = puzzle
        video.save()
    print(Puzzle.objects.filter(external_id=None).delete())


class Migration(migrations.Migration):

    dependencies = [
        ('puzzle', '0006_auto_20200605_1842'),
    ]

    operations = [
        migrations.RunPython(split_videos, lambda a,b : None)
    ]