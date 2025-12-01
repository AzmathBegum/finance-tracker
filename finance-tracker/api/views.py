from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Transaction
from .serializers import UserSerializer, TransactionSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insights(request):
    user = request.user
    transactions = user.transactions.all()

    if not transactions.exists():
        return Response({
            "summary": "No transactions found.",
            "suggestion": "Start adding your income and expenses to get insights."
        })

    income = sum(t.amount for t in transactions if t.type == "income")
    expenses = sum(t.amount for t in transactions if t.type == "expense")
    top_category = (
        transactions.order_by("-amount").first().category
        if transactions.exists() else "Miscellaneous"
    )

    # 🧠 Mock AI logic (later we’ll connect OpenAI)
    balance = income - expenses
    summary = f"Your total income is ₹{income} and expenses are ₹{expenses}."
    suggestion = "You’re saving well!" if balance > 0 else "Try reducing unnecessary expenses."

    return Response({
        "summary": summary,
        "suggestion": f"Most spending is in {top_category}. {suggestion}"
    })

# --------------------------
# USER REGISTER VIEW
# --------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------
# USER LOGIN VIEW (JWT)
# --------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


# --------------------------
# TRANSACTION LIST + CREATE
# --------------------------
class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --------------------------
# TRANSACTION DETAIL (Retrieve, Update, Delete)
# --------------------------
class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
