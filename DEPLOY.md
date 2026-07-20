# 배포 가이드

## Render 배포 (무료)

1. https://render.com/register 에서 GitHub 계정으로 가입
2. "New +" → "Web Service" 클릭
3. GitHub 저장소 `hoooon-97/vmware-web` 연결
4. 설정:
   - **Name**: vmware-web
   - **Runtime**: Node
   - **Build Command**: `npm install && cd client && npm install && npm run build`
   - **Start Command**: `node server/index.js`
5. "Create Web Service" 클릭

배포 완료 후 URL: `https://vmware-web.onrender.com`

## Vercel 배포 (대안)

```bash
cd /Users/parksanghun/company/vmware-web
vercel --prod
```

## 로컬 실행

```bash
cd /Users/parksanghun/company/vmware-web
npm install
cd client && npm install && npm run build && cd ..
node server/index.js
# http://localhost:3001 접속
```
