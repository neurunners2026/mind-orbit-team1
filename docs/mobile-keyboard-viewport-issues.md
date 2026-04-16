# 모바일 키보드 & 뷰포트 이슈 정리

> **브랜치**: `fix/mobile-keyboard-fab`
> **작성일**: 2026-04-16
> **작성 맥락**: iOS Safari / iOS Chrome / Android Chrome 환경에서 소프트웨어 키보드가 올라올 때 발생하는 플로팅 UI 가림, 횡스크롤, 뷰포트 어긋남 등의 문제를 조사·수정한 과정과 결론 정리

---

## 1. 발단: 플로팅 툴바가 키보드에 가려지는 문제

편집 모드 진입 시 소프트웨어 키보드가 올라오면, `<Panel position="bottom-center">`로 배치된 하단 플로팅 툴바(추가/형제/삭제/맞춤 버튼)가 키보드 뒤에 가려져 조작 불능이 되는 현상.

### 1-1. 초기 접근: `visualViewport` API

키보드 높이를 감지하여 툴바의 `marginBottom`을 동적으로 조절하는 방식을 시도.

```tsx
// 초기 구현
const update = () => {
  const kbH = window.innerHeight - vv.height - vv.offsetTop;
  setKeyboardHeight(kbH > 50 ? kbH : 0);
};
```

**결과**: Android Chrome에서는 동작했으나, iOS Safari / iOS Chrome에서 불안정.

### 1-2. iOS Chrome 문제: `innerHeight`가 함께 줄어듦

iOS Chrome(WKWebView)에서는 키보드가 올라올 때 `window.innerHeight`와 `visualViewport.height`가 **동시에 줄어들어** 차이가 0이 됨.

| 상태 | innerHeight | vv.height | vv.offsetTop |
|---|---|---|---|
| 키보드 닫힘 | 714 | 714 | 0 |
| 키보드 열림 | 524 | 404 | 189.65 |

**시행착오 — `stableHeightRef` + `vv.height` + `vv.offsetTop`**:

```tsx
// 두 번째 시도
const kbH = stableHeightRef.current - vv.height - vv.offsetTop;
// 714 - 404 - 189.65 = 120 → 실제 키보드 높이(190)보다 70px 부족
```

`vv.offsetTop`은 iOS가 포커스된 input을 보이게 하려고 스크롤한 양이라, 키보드 높이 계산에 섞이면 결과가 왜곡됨.

### 1-3. 결론: 단순한 공식이 가장 정확

```tsx
const stableHeightRef = useRef(window.innerHeight);

const update = () => {
  if (window.innerHeight > stableHeightRef.current) {
    stableHeightRef.current = window.innerHeight; // 화면 회전 대응
  }
  const kbH = stableHeightRef.current - window.innerHeight;
  setKeyboardHeight(kbH > 50 ? kbH : 0);
};
```

**원리**: `interactive-widget=resizes-content` 메타태그가 있든 없든(iOS Safari는 이 메타태그를 무시하지만 자체적으로 innerHeight를 줄임), `window.innerHeight`는 키보드가 올라올 때 줄어든다. 마운트 시점의 값을 기준으로 차이만 구하면 정확한 키보드 높이가 된다.

**검증 데이터** (iPhone 17 / iOS 26.4 시뮬레이터, Safari):
- 키보드 닫힘: `innerHeight=714`
- 키보드 열림: `innerHeight=524`
- 차이: `190px` = 실제 키보드 높이와 일치

---

## 2. 근본 원인 발견: iOS Safari 자동 줌인

### 2-1. 증상: 횡스크롤과 UI 치우침

키보드 높이 계산이 맞는데도, iOS에서 플로팅 버튼이 한쪽으로 치우치고 가로 스크롤이 생기는 현상이 지속. 시뮬레이터 + 실기기(팀원 화경님 테스트) 모두 재현.

### 2-2. 진단 과정

Safari Web Inspector로 뷰포트 상태 확인:

```
documentElement.scrollWidth: 402
documentElement.clientWidth: 402  (= 레이아웃 뷰포트)
window.innerWidth: 352            (= 비주얼 뷰포트)
visualViewport.width: 352
```

**레이아웃 뷰포트(402)와 비주얼 뷰포트(352)가 다르다** = 페이지가 줌인된 상태.

비율 계산: `402 / 352 = 1.1420...` ≈ **`16 / 14 = 1.1428...`**

### 2-3. 원인: input font-size 14px

iOS Safari는 **16px 미만 font-size의 `<input>`에 포커스가 들어가면**, 가독성을 위해 `16 / (실제 font-size)` 비율로 자동 줌인한다. 이 줌은 blur 후에도 유지됨.

```css
/* MindmapNode.css — 기존 */
.mindmap-node__label,
.mindmap-node__input {
  font-size: var(--font-size-sm); /* = 0.875rem = 14px */
}
```

**줌 비율**: `16 / 14 = 1.143x` → 레이아웃 뷰포트 402px, 비주얼 뷰포트 352px. 수치가 정확히 일치.

### 2-4. 파급 효과

이 자동 줌인은 단순히 횡스크롤만 만드는 것이 아니라, **모든 뷰포트 기반 계산을 어긋나게** 만든다:

- 플로팅 UI 위치가 한쪽으로 치우침 (React Flow Panel이 레이아웃 뷰포트 기준으로 중앙을 잡기 때문)
- 키보드 높이 계산이 왜곡됨
- `100vh`, `100dvh` 값도 비주얼 뷰포트와 불일치
- `position: fixed` 요소의 좌표가 어긋남

### 2-5. 해결

**터치 디바이스에서만 font-size를 16px(= `1rem`)으로 승격**:

```css
/* 기본 (PC) */
.mindmap-node__label,
.mindmap-node__input {
  font-size: var(--font-size-sm); /* 14px — PC에서는 콤팩트하게 유지 */
}

/* 터치 디바이스: iOS 자동 줌인 방지 */
@media (pointer: coarse) {
  .mindmap-node__label,
  .mindmap-node__input {
    font-size: 1rem; /* 16px */
  }
}
```

**`(pointer: coarse)` 미디어 쿼리를 쓰는 이유**: `max-width: 768px` 기반보다 정확. iPad 가로모드(>768px)도 iOS Safari이므로 자동 줌 대상이며, 터치 스크린 PC는 제외 가능. "화면 크기"가 아닌 "입력 방식"으로 분기하는 것이 이 문제의 본질에 맞음.

### 2-6. 참고: `interactive-widget` 메타태그

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
```

- **Android Chrome**: 이 메타태그를 인식하여, 키보드가 올라올 때 레이아웃 뷰포트를 줄여줌
- **iOS Safari**: `Viewport argument key "interactive-widget" not recognized and ignored.` 경고 발생하며 무시. 하지만 iOS Safari는 자체적으로 `window.innerHeight`를 줄이므로 우리 계산 로직에는 영향 없음
- **결론**: 경고는 무해하며, 양 플랫폼에서 동일한 JS 코드가 작동함

---

## 3. 편집 모드 진입 시 노드 중앙 정렬

### 3-1. 문제

- 줌을 많이 당겨둔 상태에서 자식 추가 시, 새 노드가 화면 밖에 생성되어 입력 중인데 노드가 안 보임
- 키보드가 올라오면 화면의 절반이 가려져, 편집 중 노드가 키보드 뒤에 숨을 수 있음

### 3-2. 해결: `mindmap:editStarted` 이벤트 + `setCenter`

MindmapNode에서 편집 모드 진입 시(`isEditing` → `true`) `mindmap:editStarted` 커스텀 이벤트를 발행하고, Editor에서 이를 수신하여 해당 노드를 뷰포트 중앙으로 이동 + 줌 보정.

**줌 보정 기준**:
- `< 0.8x` → `1x`로 올림 (너무 축소되어 가독 불가)
- `> 2x` → `2x`로 내림 (과도한 확대)
- 그 사이 → 사용자 설정 유지

**적용 범위**: 터치 디바이스(`pointer: coarse`)에서만 적용. PC에서는 사용자의 패닝/줌 의도를 존중하기 위해 개입하지 않음.

### 3-3. 타이밍 문제 (미해결 → 아래 4절에서 해결 방안 제시)

`setCenter` 호출 시점과 키보드 애니메이션 완료 시점이 엇갈려, 수직 중앙 정렬이 부정확해지는 경우가 있음. 현재 280ms 고정 지연을 사용하나, iOS 키보드 애니메이션 속도는 기기·상태에 따라 가변적이라 일관되지 않음.

---

## 4. iOS 키보드 + 편집 모드 UX 종합 해결 방안

### 4-1. 발견된 문제 목록

| # | 문제 | 원인 |
|---|---|---|
| P1 | 툴바 버튼으로 새 노드 생성 시 키보드 안 올라옴 | iOS가 비동기 `focus()`의 키보드 열기를 차단 |
| P2 | 더블클릭 위치에 따라 플로팅 툴바 수직 위치가 달라짐 | 키보드 애니메이션과 `setCenter` 애니메이션이 동시 진행되며 `keyboardHeight`가 중간값에서 결정됨 |
| P3 | 노드 중앙 정렬이 부정확 | 키보드 완전 안정화 전에 `setCenter` 실행 |

### 4-2. 핵심 인사이트

iOS Safari가 차단하는 것은 **키보드를 새로 여는** 프로그래밍적 focus뿐이다. **이미 키보드가 올라와 있을 때** 다른 input으로 focus를 옮기는 것은 허용된다.

### 4-3. 해결 전략: 시나리오별 분리

**Case A — 편집 중(키보드 열림) + 툴바 버튼으로 자식/형제 추가**

```
해결: 툴바 버튼에 onPointerDown={(e) => e.preventDefault()} 추가
```

- `e.preventDefault()`가 현재 input의 blur를 차단 → 키보드 유지
- 새 노드 생성 후 `focus()`로 포커스 전환 → iOS는 "포커스 이동"으로 인식 → 키보드 유지
- 키보드 상태 변화가 없으므로 `setCenter`를 즉시 호출 가능 (타이밍 문제 없음)
- **P1, P2, P3 모두 해결**

**Case B — 비편집 상태(키보드 닫힘) + 툴바 버튼으로 자식/형제 추가**

```
해결: 편집 모드 자동 진입을 하지 않음 (노드 생성 + 중앙 정렬 + 선택까지만)
```

- 키보드를 무리하게 열지 않아 타이밍/줌/레이아웃 문제가 원천 차단
- 사용자가 새 노드를 확인한 뒤 더블탭으로 편집 진입 (자연스러운 2단계 UX)
- **P1 회피, P2/P3 해당 없음**

**Case C — 더블클릭/더블탭으로 기존 노드 편집 (키보드가 새로 올라옴)**

```
해결: visualViewport resize 이벤트를 debounce하여 안정화 감지 후 setCenter 호출
```

- 직접 탭 제스처이므로 iOS가 키보드를 열어줌 (P1 해당 없음)
- 고정 타이머(280ms) 대신, `visualViewport` resize가 ~150ms 동안 멈추면 "키보드 애니메이션 완료"로 판단
- 이 시점에서 `setCenter` 호출 → 정확한 중앙 정렬
- **P2, P3 해결**

### 4-4. 요약 매트릭스

| 시나리오 | 키보드 | 중앙 정렬 타이밍 | 복잡도 |
|---|---|---|---|
| Case A: 편집 중 + 버튼 | `preventDefault`로 유지 | 즉시 (키보드 변화 없음) | 낮음 |
| Case B: 비편집 + 버튼 | 안 올림 (더블탭으로 진입) | 즉시 (키보드 없음) | 없음 |
| Case C: 더블탭 편집 | iOS가 자동으로 올림 | VV resize 안정화 후 | 낮음 |

### 4-5. 구현 포인트

**공통**: `mindmap:editStarted` 이벤트를 통해 Editor가 중앙 정렬을 제어하는 구조는 유지.

**Case A 구현**:
- 툴바의 "추가", "형제" 버튼에 `onPointerDown={(e) => e.preventDefault()}` 추가
- 키보드가 열린 상태에서 focus가 transfer되므로 `setCenter` 딜레이 불필요

**Case B 구현**:
- `keyboardHeight > 0` (편집 중) 여부로 분기
- 편집 중이 아니면 노드 생성 후 `mindmap:startEdit` 대신 `mindmap:selectNode` 등으로 선택만

**Case C 구현**:
- `visualViewport` resize 이벤트를 debounce(~150ms)
- resize가 안정화된 시점에 pending된 `setCenter`를 실행

---

## 5. 기타 참고사항

### 5-1. `interactive-widget=resizes-content` 메타태그와 iOS Safari

iOS Safari (iOS 26.4 기준)에서 이 메타태그는 인식되지 않으며 경고가 출력됨. 하지만 iOS Safari는 자체적으로 `window.innerHeight`를 줄이는 동작을 하므로 우리 JS 코드에는 영향 없음. Android Chrome에서는 정상 인식. 양 플랫폼에서 동일 코드 동작.

### 5-2. iOS Simulator에서 소프트웨어 키보드 표시

시뮬레이터에서는 Mac 키보드가 연결된 상태이므로 소프트웨어 키보드가 기본적으로 숨겨져 있음. **I/O → Keyboard → Connect Hardware Keyboard** 체크 해제 (단축키 `⌘⇧K`)로 소프트웨어 키보드를 표시.

### 5-3. Safari Web Inspector 연결

Mac Safari → Settings → Advanced → "Show features for web developers" 활성화 후, **Develop → Simulator - iPhone** 메뉴에서 시뮬레이터의 Safari 페이지에 Web Inspector를 연결 가능.

### 5-4. 가로 오버플로우 디버깅 스니펫

뷰포트보다 넓은 요소를 찾는 진단 코드:

```js
const VW = window.innerWidth;
[...document.querySelectorAll('*')]
  .map(el => ({ el, ...el.getBoundingClientRect() }))
  .filter(({ right, left, width }) => right > VW + 1 || left < -1 || width > VW + 1)
  .sort((a, b) => b.right - a.right)
  .slice(0, 20)
  .forEach(({ el, left, right, width }) =>
    console.log(el.tagName, el.className?.toString?.().slice(0, 40),
      `L:${Math.round(left)} R:${Math.round(right)} W:${Math.round(width)}`));
```

### 5-5. 현재 브랜치 적용 상태 (2026-04-16 기준)

| 항목 | 상태 |
|---|---|
| 키보드 높이 감지 (`stableHeightRef - innerHeight`) | ✅ 적용 완료 |
| input font-size 16px (터치 디바이스) | ✅ 적용 완료 |
| 편집 시 노드 중앙 정렬 (터치 디바이스) | ✅ 적용 완료 (타이밍 개선 필요) |
| Case A: 툴바 버튼 `preventDefault` | ⬜ 미구현 |
| Case B: 비편집 시 자동편집 진입 억제 | ⬜ 미구현 |
| Case C: VV resize debounce 기반 setCenter | ⬜ 미구현 |
