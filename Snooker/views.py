from django.shortcuts import render

def index(request):
    return render(request, "index.html")

def client(request):
    return render(request, "client.html")
