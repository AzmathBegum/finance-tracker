from django.urls import path
from .views import RegisterView, LoginView, TransactionListCreateView, TransactionDetailView, ai_insights

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("transactions/", TransactionListCreateView.as_view(), name="transactions"),
    path("transactions/<int:pk>/", TransactionDetailView.as_view(), name="transaction-detail"),
    path("insights/", ai_insights, name="ai-insights"),
]
