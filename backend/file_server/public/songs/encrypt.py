import os
from Cryptodome.Cipher import AES
from Cryptodome.Random import get_random_bytes
from Cryptodome.Util.Padding import pad

# Define a directory where your MP3 files are located
MUSIC_DIR = './backend/file_server/public/songs'

KEY = b'\xe2y\x7f\xf1\xc1\xbc\xa2\xb5\x05m \xab\xa4!\xf6\x9a1\xb1\x15\xb8\xf6\x857\xff\xc4g\x83@J#\xcf\xc2'    # 32 bytes for AES-256
IV = b'\xce\x0b\x1fyHn\x0b\xea\xd8&#\x850\xd5C\xf0'                                  # 16 bytes for AES-CBC

"""
b'\xe2y\x7f\xf1\xc1\xbc\xa2\xb5\x05m \xab\xa4!\xf6\x9a1\xb1\x15\xb8\xf6\x857\xff\xc4g\x83@J#\xcf\xc2'
b'\xce\x0b\x1fyHn\x0b\xea\xd8&#\x850\xd5C\xf0'
Base64 Encoded Key: 4nl/8cG8orUFbSCrpCH2mjGxFbj2hTf/xGeDQEojz8I=
Base64 Encoded IV: zgsfeUhuC+rYJiOFMNVD8A==
Hexadecimal Key: e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2
Hexadecimal IV: ce0b1f79486e0bead826238530d543f0
"""

def encrypt_file(file_path):
    """Encrypts a single file using AES-CBC."""
    try:
        with open(file_path, 'rb') as f_in:
            data = f_in.read()

        cipher = AES.new(KEY, AES.MODE_CBC, IV)
        encrypted_data = cipher.encrypt(pad(data, AES.block_size))

        new_file_path = file_path + '.encrypted'
        with open(new_file_path, 'wb') as f_out:
            f_out.write(encrypted_data)
        
        print(f"Encrypted '{file_path}' to '{new_file_path}'")
        return True
    except Exception as e:
        print(f"Error encrypting file {file_path}: {e}")
        return False

def encrypt_music_directory():
    """Encrypts all MP3 files in the music directory."""
    if not os.path.exists(MUSIC_DIR):
        print(f"Error: Directory '{MUSIC_DIR}' not found.")
        return

    for filename in os.listdir(MUSIC_DIR):
        if filename.endswith('.mp3'):
            file_path = os.path.join(MUSIC_DIR, filename)
            encrypt_file(file_path)

if __name__ == '__main__':
    encrypt_music_directory()