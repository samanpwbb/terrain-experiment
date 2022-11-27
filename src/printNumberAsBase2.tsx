function printNumberAsBase2(n: number) {
  return (n >>> 0).toString(2).padStart(4, '0');
}
