from django import forms
from django.core.files.storage import default_storage

from puzzle.models import Solve, Puzzle
from django.contrib.postgres.forms import SimpleArrayField
import unrest_schema

@unrest_schema.register
class PuzzleForm(forms.ModelForm):
    readonly_fields = ['constraints', 'screenshot', 'meta', 'videos']
    class Meta:
        model = Puzzle
        fields = (
            'external_id',
            'publish_date',
            'flag',
            'source',
            'data',
        )

@unrest_schema.register
class PuzzleAdminForm(forms.ModelForm):
    @staticmethod
    def get_one(external_id):
        return Puzzle.objects.get(external_id=external_id)
    class Meta:
        model = Puzzle
        fields = ('flag',)


@unrest_schema.register
class PuzzleDataForm(forms.ModelForm):
    required_constraints = SimpleArrayField(forms.CharField(), required=False)
    screenshot = forms.FileField(required=False)
    def clean_screenshot(self):
        screenshot = self.cleaned_data.get('screenshot')
        if screenshot:
            saved = default_storage.save('screenshots/' + screenshot.name, screenshot)
            return default_storage.url(saved)

    def save(self, commit=True):
        for attr, value in self.cleaned_data.items():
            if value is not None:
                self.instance.data[attr] = value
        return super().save(commit=commit)

    class Meta:
        model = Puzzle
        fields = ('required_constraints', 'screenshot')


@unrest_schema.register
class SolveForm(forms.ModelForm):
    constraints = SimpleArrayField(forms.CharField())
    answer = SimpleArrayField(forms.IntegerField())

    def save(self, commit=True):
        self.instance.user = self.request.user
        attrs = ['answer', 'constraints']
        self.instance.data = { attr: self.cleaned_data[attr] for attr in attrs }
        self.instance.data['valid'] = self.instance.puzzle.validate(self.cleaned_data['answer'])
        return super().save(commit=commit)

    class Meta:
        model = Solve
        fields = ('constraints', 'puzzle', 'answer')
