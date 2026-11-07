"""Fraction comparison used by the current practice page."""
from fractions import Fraction

def compare(left, right):
    a, b = Fraction(*left), Fraction(*right)
    return 'greater' if a > b else 'less' if a < b else 'equal'

def explanation(left, right):
    if left[1] == right[1]:
        larger = 'A' if left[0] > right[0] else 'B'
        return f'{larger} has more equal-sized parts.'
    return f'The comparison is {compare(left, right)}.'

def render(problem):
    return {'verdict': compare(*problem), 'explanation': explanation(*problem)}
