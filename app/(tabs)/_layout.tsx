import { Tabs } from "expo-router";
import { View } from "react-native";

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: focused ? 1 : 0.4,
      }}
    >
      {children}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopWidth: 0.5,
          borderTopColor: "rgba(255,255,255,0.05)",
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: "#C8F04C",
        tabBarInactiveTintColor: "rgba(255,255,255,0.25)",
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <HomeIcon focused={focused} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Treinos",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <WorkoutsIcon focused={focused} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Personal",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <SearchIcon focused={focused} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <ProfileIcon focused={focused} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function HomeIcon({ focused }: { focused: boolean }) {
  const color = focused ? "#C8F04C" : "rgba(255,255,255,0.25)";
  return (
    <View
      style={{
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 3,
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -6,
            left: 2,
            width: 12,
            height: 8,
            borderLeftWidth: 1.5,
            borderTopWidth: 1.5,
            borderRightWidth: 1.5,
            borderColor: color,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

function WorkoutsIcon({ focused }: { focused: boolean }) {
  const color = focused ? "#C8F04C" : "rgba(255,255,255,0.25)";
  return (
    <View
      style={{
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: i === 1 ? 14 : 18,
            height: 1.5,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

function SearchIcon({ focused }: { focused: boolean }) {
  const color = focused ? "#C8F04C" : "rgba(255,255,255,0.25)";
  return (
    <View
      style={{
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 13,
          height: 13,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 8,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: 6,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? "#C8F04C" : "rgba(255,255,255,0.25)";
  return (
    <View
      style={{
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 9,
          height: 9,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: 5,
        }}
      />
      <View
        style={{
          width: 16,
          height: 7,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderWidth: 1.5,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: 2,
        }}
      />
    </View>
  );
}
