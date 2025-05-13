from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, TransactionSerializer, BudgetSerializer
from accounts.serializers import UserSerializer
from accounts.models import CustomUser
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import check_password
from .models import Transaction, Budget
from django.shortcuts import get_object_or_404

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(commit=False) #prevent premature saving
            user.set_password(serializer.validated_data["password"]) #hash pass correctly

            user.save() 

            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "user": UserSerializer(user).data  # Uses serializer for structured response
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

        print(f"Stored Password for {email}: {user.password}")  # Debugging
        password_matches = check_password(password, user.password)
        print(f"Password Match: {password_matches}")  # Debugging

        if not password_matches:
            return Response({"error": "Invalid password."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)    

class LogoutView(APIView):
    def post(self, request):
        try:
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_active_accounts(request):
    user = request.user
    active_accounts = [
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar": user.avatar.url if user.avatar else None,
            "isActive": True  # Ensuring the logged-in user is marked as active
        }
    ]
    return Response(active_accounts, status=status.HTTP_200_OK)



class TransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_id=None):
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id, user=request.user)
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)

        transactions = Transaction.objects.filter(user=request.user).order_by('-date', '-created_at')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            transaction = serializer.save(user=request.user)
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, id=transaction_id, user=request.user)
        serializer = TransactionSerializer(transaction, data=request.data)
        if serializer.is_valid():
            transaction = serializer.save()
            return Response(TransactionSerializer(transaction).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, id=transaction_id, user=request.user)
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, budget_id=None):
        if budget_id:
            budget = get_object_or_404(Budget, id=budget_id, user=request.user)
            serializer = BudgetSerializer(budget)
            return Response(serializer.data)

        budgets = Budget.objects.filter(user=request.user).order_by('-start_date')
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            budget = serializer.save(user=request.user)
            return Response(BudgetSerializer(budget).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, budget_id):
        budget = get_object_or_404(Budget, id=budget_id, user=request.user)
        serializer = BudgetSerializer(budget, data=request.data)
        if serializer.is_valid():
            budget = serializer.save()
            return Response(BudgetSerializer(budget).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, budget_id):
        budget = get_object_or_404(Budget, id=budget_id, user=request.user)
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
from django.db.models import Sum
from django.db.models.functions import TruncMonth
import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from io import BytesIO

class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_spending_report(self, user, start_date=None, end_date=None):
        transactions = Transaction.objects.filter(
            user=user,
            type='expense'
        )
        if start_date:
            transactions = transactions.filter(date__gte=start_date)
        if end_date:
            transactions = transactions.filter(date__lte=end_date)

        return transactions.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')

    def get_income_report(self, user, start_date=None, end_date=None):
        transactions = Transaction.objects.filter(
            user=user,
            type='income'
        )
        if start_date:
            transactions = transactions.filter(date__gte=start_date)
        if end_date:
            transactions = transactions.filter(date__lte=end_date)

        return transactions.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')

    def get_trends(self, user, months=12):
        return Transaction.objects.filter(
            user=user
        ).annotate(
            month=TruncMonth('date')
        ).values('month', 'type').annotate(
            total=Sum('amount')
        ).order_by('month', 'type')

    def export_csv(self, data, filename):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Category', 'Amount'])
        for row in data:
            writer.writerow([row['category'], 'total'])
        return response

    def export_pdf(self, data, filename):
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        y = 800
        p.drawString(100, y, filename)
        y -= 20
        for row in data:
            p.drawString(100, y, f"{row['category']}: {row['total']}")
            y -= 15
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        return response

    def get(self, request, report_type):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        export_format = request.query_params.get('export')

        if report_type == 'spending':
            data = self.get_spending_report(request.user, start_date, end_date)
            filename = 'spending_report'
        elif report_type == 'income':
            data = self.get_income_report(request.user, start_date, end_date)
            filename = 'income_report'
        elif report_type == 'trends':
            data = self.get_trends(request.user)
            filename = 'trends_report'
        else:
            return Response({'error': 'Invalid report type'}, status=400)

        if export_format == 'csv':
            return self.export_csv(data, filename)
        elif export_format == 'pdf':
            return self.export_pdf(data, filename)

        return Response(data)