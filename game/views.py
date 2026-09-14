import json
import chess
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Global or session-based board instance for testing
board = chess.Board()

def index(request):
    global board
    board = chess.Board()  # Reset board on page load
    return render(request, 'index.html')

@csrf_exempt
def make_move(request):
    global board
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            move_uci = data.get('move')
            
            # Create a move object from UCI string (e.g., 'e2e4')
            move = chess.Move.from_uci(move_uci)
            
            # Check if move is legal
            if move in board.legal_moves:
                board.push(move)
                return JsonResponse({
                    'is_valid': True,
                    'fen': board.fen()
                })
            else:
                return JsonResponse({
                    'is_valid': False,
                    'fen': board.fen()
                })
        except Exception as e:
            return JsonResponse({'is_valid': False, 'error': str(e)})

    return JsonResponse({'is_valid': False, 'error': 'Invalid request method'})