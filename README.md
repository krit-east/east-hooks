# east-hooks

React hooks สำหรับงานที่ใช้บ่อยในแอปพลิเคชัน React

## การติดตั้ง (Installation)

```bash
npm install east-hooks
# หรือ
yarn add east-hooks
```

## Hooks ที่มีให้ใช้งาน

### useFetch

Hook สำหรับการส่งคำขอ API พร้อมกับจัดการสถานะการโหลดและข้อผิดพลาดโดยอัตโนมัติ รวมถึงการแสดง Alert และ Modal

#### วิธีใช้งานพื้นฐาน

```tsx
import { useFetch } from 'east-hooks';

const MyComponent = () => {
  const { data, loading, error, trigger } = useFetch<ResponseType>(
    'POST',                          // HTTP method
    '/api/users',                    // URL endpoint
    { alert: true },                 // options
    { name: 'John', age: 30 }        // body data (จะถูกแปลงเป็น JSON โดยอัตโนมัติ)
  );

  const handleSubmit = () => {
    trigger(); // เรียกใช้ API
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'กำลังส่งข้อมูล...' : 'บันทึกข้อมูล'}
      </button>
      {error && <p>เกิดข้อผิดพลาด: {error.message}</p>}
    </div>
  );
};
```

#### รายละเอียดพารามิเตอร์

```tsx
useFetch<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: RequestOptions,
  bodyData?: any
)
```

1. `method`: HTTP method (GET, POST, PUT, DELETE)
2. `url`: URL ปลายทางของ API
3. `options`: ตัวเลือกเพิ่มเติม (ไม่จำเป็นต้องระบุ)
   ```typescript
   interface RequestOptions {
     alert?: boolean;                   // เปิดใช้งานการแจ้งเตือนแบบ toast notification
     headers?: Record<string, string>;  // HTTP headers เพิ่มเติม
     immediate?: boolean;               // เรียกใช้ API ทันทีที่ component ถูกโหลด
     confirmModal?: {                   // แสดง modal ยืนยันก่อนส่ง API request
       title: string;                   // หัวข้อของ confirm modal
       content: string;                 // เนื้อหาของ confirm modal
     };
     notificationModal?: {              // แสดง modal แจ้งเตือนหลังได้ผลลัพธ์จาก API
       title?: string;                  // หัวข้อของ notification modal
       content?: string;                // เนื้อหาของ notification modal
       duration?: number;               // ระยะเวลาแสดง modal ในหน่วยมิลลิวินาที (ms) (ค่าเริ่มต้น: 5000)
     };
   }
   ```
4. `bodyData`: ข้อมูลที่จะส่งไปกับคำขอ (เฉพาะ POST, PUT, DELETE)

#### ค่าที่ return กลับมา

```typescript
{
  data: T | null;            // ข้อมูลที่ได้รับจาก API
  loading: boolean;          // สถานะการโหลด (true/false)
  error: Error | null;       // ข้อผิดพลาดที่เกิดขึ้น (Error object หรือ null)
  trigger: () => Promise<void>; // ฟังก์ชันสำหรับเรียกใช้ API
}
```

#### ตัวอย่างการใช้งาน

1. **การใช้งานพื้นฐาน**

```tsx
const { data, loading, error, trigger } = useFetch<User[]>('GET', '/api/users');

// เรียกใช้งาน
trigger();
```

2. **การใช้งานกับ Alert (Toast Notification)**

```tsx
const { trigger } = useFetch('POST', '/api/users', 
  { alert: true }, 
  { name: 'John' }
);

// จะแสดง toast notification เมื่อ API response มีรูปแบบดังนี้
// { message: "บันทึกสำเร็จ", description: "เพิ่มผู้ใช้ใหม่แล้ว", status: "success" }
```

3. **การใช้งานกับ Confirm Modal**

```tsx
const { trigger } = useFetch('DELETE', '/api/users/1', {
  confirmModal: {
    title: 'ยืนยันการลบ',
    content: 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?'
  }
});

// เมื่อเรียกใช้ trigger() จะแสดง confirm modal ก่อน
// ถ้ากด "ยืนยัน" จะทำการส่ง request
// ถ้ากด "ยกเลิก" จะยกเลิกการส่ง request
```

4. **การใช้งานกับ Notification Modal**

```tsx
const { trigger } = useFetch('PUT', '/api/users/1', {
  notificationModal: {
    title: 'แก้ไขข้อมูลสำเร็จ',
    content: 'ระบบได้บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว',
    duration: 3000 // แสดงเป็นเวลา 3 วินาที
  }
}, { name: 'Updated Name' });

// เมื่อ API ทำงานเสร็จจะแสดง notification modal
// พร้อมนับถอยหลังและปุ่มปิด
```

5. **การใช้งานทั้ง Confirm Modal และ Notification Modal**

```tsx
const { trigger } = useFetch('POST', '/api/users', {
  confirmModal: {
    title: 'ยืนยันการเพิ่มข้อมูล',
    content: 'คุณต้องการเพิ่มข้อมูลผู้ใช้ใหม่ใช่หรือไม่?'
  },
  notificationModal: {
    title: 'เพิ่มข้อมูลสำเร็จ',
    content: 'ระบบได้บันทึกข้อมูลผู้ใช้ใหม่เรียบร้อยแล้ว',
    duration: 5000 // แสดงเป็นเวลา 5 วินาที
  }
}, { name: 'John', email: 'john@example.com' });

// 1. แสดง confirm modal เมื่อเรียกใช้ trigger()
// 2. ถ้ากด "ยืนยัน" จะทำการส่ง request
// 3. เมื่อ API ทำงานเสร็จจะแสดง notification modal
```

6. **การใช้งานกับ FormData**

```tsx
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  trigger();
};

const { trigger } = useFetch('POST', '/api/upload', 
  { alert: true }, 
  formData // ส่งเป็น FormData โดยตรง (จะไม่แปลงเป็น JSON)
);
```

## Providers

### HooksProvider (แนะนำให้ใช้)

Provider ตัวเดียวที่รวมความสามารถของทั้ง AlertProvider และ ModalProvider ไว้ด้วยกัน

#### วิธีใช้งาน HooksProvider

```tsx
import { HooksProvider } from 'east-hooks';

const App = () => {
  return (
    <HooksProvider>
      <YourApp />
    </HooksProvider>
  );
};

export default App;
```

เมื่อใช้ `HooksProvider` คุณสามารถใช้งาน `useAlert` และ `useModal` hooks ได้ทันที:

```tsx
import { useAlert, useModal, useFetch } from 'east-hooks';

const YourComponent = () => {
  const { showAlert } = useAlert();
  const { showConfirmModal, showNotificationModal } = useModal();
  
  // ใช้งาน useFetch ได้พร้อมความสามารถ alert, confirmModal และ notificationModal
  const { trigger } = useFetch('POST', '/api/users', {
    alert: true,
    confirmModal: {
      title: 'ยืนยัน',
      content: 'คุณต้องการทำรายการนี้ใช่หรือไม่?'
    }
  });
  
  return (
    <div>
      <button onClick={() => trigger()}>บันทึกข้อมูล</button>
    </div>
  );
};
```

### AlertProvider

Provider สำหรับแสดง toast notification ที่มุมบนขวาของหน้าจอ

#### วิธีใช้งาน AlertProvider

1. ครอบ component ที่ต้องการใช้งาน alert ด้วย `AlertProvider`:

```tsx
import { AlertProvider } from 'east-hooks';

const App = () => {
  return (
    <AlertProvider>
      <YourComponent />
    </AlertProvider>
  );
};
```

2. ใช้งาน `useAlert` hook เพื่อแสดง alert:

```tsx
import { useAlert } from 'east-hooks';

const YourComponent = () => {
  const { showAlert } = useAlert();
  
  const handleClick = () => {
    showAlert({
      message: 'บันทึกสำเร็จ',
      description: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      type: 'success', // 'success', 'info', 'warning', 'error'
      duration: 3000   // เวลาแสดงในหน่วย ms (ค่าเริ่มต้น: 3000)
    });
  };
  
  return <button onClick={handleClick}>แสดง Alert</button>;
};
```

### ModalProvider

Provider สำหรับแสดง modal แบบ confirm และ notification

#### วิธีใช้งาน ModalProvider

1. ครอบ component ที่ต้องการใช้งาน modal ด้วย `ModalProvider`:

```tsx
import { AlertProvider, ModalProvider } from 'east-hooks';

const App = () => {
  return (
    <AlertProvider>
      <ModalProvider>
        <YourComponent />
      </ModalProvider>
    </AlertProvider>
  );
};
```

2. ใช้งาน `useModal` hook เพื่อแสดง modal:

```tsx
import { useModal } from 'east-hooks';

const YourComponent = () => {
  const { showConfirmModal, showNotificationModal } = useModal();
  
  const handleShowConfirm = () => {
    showConfirmModal(
      'ยืนยันการลบ',              // title
      'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?', // content
      () => {
        // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม "ยืนยัน"
        console.log('ผู้ใช้กดยืนยัน');
        // ทำการลบข้อมูล...
      },
      () => {
        // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม "ยกเลิก" (optional)
        console.log('ผู้ใช้กดยกเลิก');
      }
    );
  };
  
  const handleShowNotification = () => {
    showNotificationModal(
      'บันทึกสำเร็จ',               // title
      'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว', // content
      5000                         // duration (ms) (optional, ค่าเริ่มต้น: 5000)
    );
  };
  
  return (
    <div>
      <button onClick={handleShowConfirm}>แสดง Confirm Modal</button>
      <button onClick={handleShowNotification}>แสดง Notification Modal</button>
    </div>
  );
};
```

## การใช้งาน Providers ร่วมกัน

**แนะนำ**: ใช้ `HooksProvider` ซึ่งจัดการรวม providers ทั้งหมดไว้ในที่เดียว:

```tsx
import { HooksProvider } from 'east-hooks';

const App = () => {
  return (
    <HooksProvider>
      <YourApp />
    </HooksProvider>
  );
};

export default App;
```

**ทางเลือก**: หากต้องการจัดการ providers แยกกัน:

```tsx
import { AlertProvider, ModalProvider } from 'east-hooks';

const App = () => {
  return (
    <AlertProvider>
      <ModalProvider>
        <YourApp />
      </ModalProvider>
    </AlertProvider>
  );
};

export default App;
```

## License

MIT
