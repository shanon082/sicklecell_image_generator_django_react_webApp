from django.db import models

class Process(models.Model):
    original_file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    multiplier = models.IntegerField()
    processed_file = models.FileField(upload_to='generated_zips/%Y/%m/%d/', null=True, blank=True)
    classification_summary = models.JSONField(null=True, blank=True)
    gan_used = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Process {self.id} - {self.original_file.name}"

    class Meta:
        app_label = 'api' 