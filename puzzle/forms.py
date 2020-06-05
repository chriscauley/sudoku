from django import forms

from puzzle.models import Solve
from django.contrib.postgres.forms import SimpleArrayField
from unrest import schema

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
