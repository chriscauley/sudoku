from django import forms
from django.core.files.storage import default_storage

from puzzle.models import Solve, Puzzle
from django.contrib.postgres.forms import SimpleArrayField
from unrest import schema

@schema.register
class PuzzleAdminForm(forms.ModelForm):
    class Meta:
        model = Puzzle
        fields = ('flag',)


@schema.register
class PuzzleDataForm(forms.ModelForm):
    required_constraints = SimpleArrayField(forms.CharField(), required=False)
    screenshot = forms.FileField(required=False)
    def clean_screenshot(self):
        screenshot = self.cleaned_data.get('screenshot')
        if screenshot:
            saved = default_storage.save('screenshots/' + screenshot.name, screenshot)
            return default_storage.url(saved)
    def clean(self):
        if not self.request.user.is_staff:
            raise ValidationError("Only staff are allowed to save puzzles")

    def save(self, commit=True):
        for attr, value in self.cleaned_data.items():
            print('saving', attr, value)
            if value:
                self.instance.data[attr] = value
        return super().save(commit=commit)

    class Meta:
        model = Puzzle
        fields = ('required_constraints', 'screenshot')


@schema.register
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
