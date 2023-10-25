from os import listdir, remove
from os.path import isfile, join
from typing import List

data_base_dir: List[str] = ["data"]
data_dirs_to_clean: List[str] = []
data_dirs_to_clean.append("auth_tokens")
data_dirs_to_clean.append("ballots")
data_dirs_to_clean.append("config")
data_dirs_to_clean.append("hashes")
data_dirs_to_clean.append("trustees")


def clean_data_dirs() -> None:
    for dir in data_dirs_to_clean:
        full_dir = join(*data_base_dir, dir)
        fnames = [f for f in listdir(full_dir) if isfile(join(full_dir, f))]
        for fname in fnames:
            if fname == '.gitkeep':
                continue
            remove(join(full_dir, fname))


if __name__ == '__main__':
    clean_data_dirs()
