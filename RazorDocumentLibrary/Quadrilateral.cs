using System.Text.Json;

namespace RazorDocumentLibrary
{
    /// <summary> 
    ///  Represents a quadrilateral of a document.
    /// </summary>
    public class Quadrilateral
    {
        public int[] Points { get; set; } = new int[8];
        public string location;

        public Quadrilateral(string location)
        {
            this.location = location;
        }

        public static List<Quadrilateral> WrapQuads(JsonElement? result)
        {
            List<Quadrilateral> results = new List<Quadrilateral>();
            if (result != null)
            {
                JsonElement element = result.Value;

                if (element.ValueKind == JsonValueKind.Array)
                {
                    foreach (JsonElement item in element.EnumerateArray())
                    {
                        if (item.TryGetProperty("location", out JsonElement locationValue))
                        {
                            Quadrilateral? quadrilateral = WrapQuad(item);
                            if (quadrilateral != null)
                            {
                                results.Add(quadrilateral);
                            }
                        }
                    }
                }
            }
            return results;
        }

        public static Quadrilateral? WrapQuad(JsonElement result)
        {
            Quadrilateral? quadrilateral = null;
            if (result.TryGetProperty("location", out JsonElement locationValue))
            {
                quadrilateral = new Quadrilateral(locationValue.ToString());
                if (locationValue.TryGetProperty("points", out JsonElement pointsValue))
                {
                    int index = 0;
                    if (pointsValue.ValueKind == JsonValueKind.Array)
                    {
                        foreach (JsonElement point in pointsValue.EnumerateArray())
                        {
                            if (point.TryGetProperty("x", out JsonElement xValue))
                            {
                                int intValue = xValue.GetInt32();
                                quadrilateral.Points[index++] = intValue;
                            }

                            if (point.TryGetProperty("y", out JsonElement yValue))
                            {
                                int intValue = yValue.GetInt32();
                                quadrilateral.Points[index++] = intValue;
                            }
                        }
                    }
                }
            }

            return quadrilateral;
        }
    }
}
