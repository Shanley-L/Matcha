import os
from functools import lru_cache
import nltk
from nltk.corpus import words as nltk_words

@lru_cache(maxsize=1)
def load_english_words():
    """
    Loads a set of English words (length >= 3) for password checking using nltk's words corpus.
    Downloads the corpus if not already present.
    """
    try:
        word_list = nltk_words.words()
    except LookupError:
        nltk.download('words')
        word_list = nltk_words.words()
    return set(word.lower() for word in word_list if len(word) >= 3)

def contains_english_word(password: str) -> bool:
    """
    Checks if the password contains any English word (length >= 3) as a substring.
    Args:
        password (str): The password to check.
    Returns:
        bool: True if an English word is found, False otherwise.
    """
    words = load_english_words()
    pw = password.lower()
    n = len(pw)
    for i in range(n):
        for j in range(i+3, n+1):  # substrings of length >= 3
            if pw[i:j] in words:
                return True
    return False 