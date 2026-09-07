import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { todayISO } from "@/lib/dates";
import { useThemeControls } from "@/theme/useTheme";
import {
  Btn,
  Check,
  Chip,
  ColorSwatchPicker,
  DateField,
  Dialog,
  EmptyState,
  FieldRow,
  Input,
  ListBox,
  ListRow,
  MonthField,
  Progress,
  QuarterField,
  Screen,
  Select,
  TabBar,
  TabPanel,
  TextArea,
  Txt,
  Window,
  YearField,
  showToast,
} from "@/ui";

/**
 * Dev-only gallery of the whole UI kit in the active theme. Switch themes at the top to check
 * every component in Chicago, Luna and Slate. Not reachable in a production build.
 */
export function KitchenSinkScreen() {
  const router = useRouter();
  const { themes, setThemeId, current } = useThemeControls();
  const [checked, setChecked] = useState(true);
  const [tab, setTab] = useState("one");
  const [select, setSelect] = useState("2");
  const [date, setDate] = useState<string | null>(todayISO());
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [quarter, setQuarter] = useState(`${todayISO().slice(0, 4)}-Q3`);
  const [year, setYear] = useState(todayISO().slice(0, 4));
  const [color, setColor] = useState("#008080");
  const [text, setText] = useState("");
  const [dialog, setDialog] = useState(false);

  return (
    <Screen onBack={() => router.back()}>
      <Window title="Display" icon="🎨">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {themes.map((th) => (
            <Chip key={th.id} label={th.name} active={th.id === current} onPress={() => setThemeId(th.id)} />
          ))}
        </View>
      </Window>

      <Window title="Type" icon="🔤">
        <Txt>body — the quick brown fox 0123456789</Txt>
        <Txt variant="bold">bold — the quick brown fox</Txt>
        <Txt variant="small">small — the quick brown fox</Txt>
        <Txt variant="muted">muted — the quick brown fox</Txt>
        <Txt variant="danger">danger — overdue!</Txt>
        <Txt variant="link">link — Open Tasks →</Txt>
      </Window>

      <Window
        title="Buttons"
        icon="🔘"
        actions={
          <Btn small onPress={() => showToast("Toast from the title bar.")}>
            Toast
          </Btn>
        }
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <Btn onPress={() => {}}>Normal</Btn>
          <Btn primary onPress={() => {}}>
            Primary
          </Btn>
          <Btn small onPress={() => {}}>
            Small
          </Btn>
          <Btn disabled onPress={() => {}}>
            Disabled
          </Btn>
          <Btn onPress={() => setDialog(true)}>Open dialog…</Btn>
        </View>
      </Window>

      <Window title="Inputs" icon="⌨️">
        <FieldRow label="Text:">
          <Input placeholder="Type something…" value={text} onChangeText={setText} />
        </FieldRow>
        <FieldRow label="Notes:">
          <TextArea rows={3} placeholder="Multi-line…" />
        </FieldRow>
        <FieldRow label="Priority:">
          <Select
            title="Priority"
            value={select}
            onChange={setSelect}
            options={[
              { value: "1", label: "P1 — High" },
              { value: "2", label: "P2 — Normal" },
              { value: "3", label: "P3 — Low" },
            ]}
          />
        </FieldRow>
        <FieldRow label="Due date:">
          <DateField value={date} onChange={setDate} allowClear />
        </FieldRow>
        <FieldRow label="Month:">
          <MonthField value={month} onChange={setMonth} />
        </FieldRow>
        <FieldRow label="Quarter:">
          <QuarterField value={quarter} onChange={setQuarter} />
        </FieldRow>
        <FieldRow label="Year:">
          <YearField value={year} onChange={setYear} />
        </FieldRow>
        <FieldRow label="Colour:">
          <ColorSwatchPicker value={color} onChange={setColor} />
        </FieldRow>
        <Check checked={checked} onChange={setChecked} label="Show completed" />
      </Window>

      <Window title="Progress" icon="📊">
        <Progress value={3} max={8} />
        <View style={{ height: 6 }} />
        <Progress value={8} max={8} />
      </Window>

      <View>
        <TabBar
          active={tab}
          onSelect={setTab}
          tabs={[
            { key: "one", label: "Today" },
            { key: "two", label: "This Week" },
            { key: "three", label: "All" },
          ]}
        />
        <TabPanel>
          <ListBox>
            <ListRow
              left={<Check checked={false} onChange={() => {}} />}
              title="Write the weekly review"
              subtitle="Pull numbers from the dashboard first"
              right={<Txt variant="danger">P1</Txt>}
              onPress={() => {}}
            />
            <ListRow
              left={<Check checked onChange={() => {}} />}
              title="Water the plants"
              strike
              right={<Txt variant="muted">P3</Txt>}
              onPress={() => {}}
              last
            />
          </ListBox>
        </TabPanel>
      </View>

      <Window title="Chips" icon="🏷️">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <Chip label="All goals" active count={12} onPress={() => {}} />
          <Chip label="Health" color="#008000" count={4} onPress={() => {}} />
          <Chip label="Career" color="#800080" count={3} onPress={() => {}} />
        </View>
      </Window>

      <Window title="Empty state" icon="🕳️">
        <EmptyState icon="🎉" text="All clear." />
      </Window>

      <Dialog
        title="Task Properties"
        icon="📋"
        open={dialog}
        onClose={() => setDialog(false)}
        footer={
          <>
            <Btn small onPress={() => setDialog(false)}>
              Cancel
            </Btn>
            <Btn small primary onPress={() => setDialog(false)}>
              OK
            </Btn>
          </>
        }
      >
        <FieldRow label="Title:">
          <Input defaultValue="Sample task" />
        </FieldRow>
        <FieldRow label="Description:">
          <TextArea rows={3} defaultValue="Everything in the kit works inside a dialog too." />
        </FieldRow>
        <FieldRow label="Due date:">
          <DateField value={date} onChange={setDate} allowClear />
        </FieldRow>
      </Dialog>
    </Screen>
  );
}
