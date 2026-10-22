import pathlib
import subprocess

root = pathlib.Path(__file__).resolve().parent
raise SystemExit(subprocess.call(["node", str(root / "script.js")], cwd=root))
