import sys, subprocess, glob, os
from PIL import Image
f, out, r, cols = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
subprocess.run(["pdftoppm","-r",r,"-png",f,"/tmp/_sh"],check=True)
ims=[Image.open(p) for p in sorted(glob.glob("/tmp/_sh-*.png"))]
w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
c=Image.new("RGB",(cols*(w+8),rows*(h+8)),"#777")
for i,im in enumerate(ims): c.paste(im,((i%cols)*(w+8),(i//cols)*(h+8)))
c.save(out); [os.remove(p) for p in glob.glob("/tmp/_sh-*.png")]
