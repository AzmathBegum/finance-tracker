from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom user model extending Django’s default user"""
    name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # keep username for admin login

    def __str__(self):
        return self.email


class Transaction(models.Model):
    """Model for income and expense tracking"""
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - {self.type} - ₹{self.amount}"
