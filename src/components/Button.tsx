export function Button(props: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <button
      className="w-30 cursor-pointer	rounded-md bg-black/25 px-2 py-1"
      onClick={props.onPress}
    >
      {props.children}
    </button>
  );
}
